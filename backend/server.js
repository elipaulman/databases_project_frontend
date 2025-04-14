const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS with more permissive options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to SQLite database
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'bookstore.db')
  : path.join(__dirname, '../bookstore.db');

console.log('Database path:', dbPath);
console.log('Environment:', process.env.NODE_ENV);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    console.error('Database path:', dbPath);
    console.error('Current directory:', __dirname);
  } else {
    console.log('Connected to SQLite database');
    console.log('Database path:', dbPath);
  }
});

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Endpoints
app.get('/api/books', (req, res) => {
  console.log('Fetching books...');
  db.all(`
    SELECT b.*, c.CategoryName, p.Name as PublisherName,
           GROUP_CONCAT(a.Name) as Authors
    FROM book b
    LEFT JOIN category c ON b.CategoryID = c.CategoryID
    LEFT JOIN publisher p ON b.PublisherID = p.PublisherID
    LEFT JOIN book_author ba ON b.ISBN = ba.ISBN
    LEFT JOIN author a ON ba.AuthorID = a.AuthorID
    GROUP BY b.ISBN
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching books:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`Found ${rows.length} books`);
    res.json(rows);
  });
});

app.get('/api/authors', (req, res) => {
  db.all('SELECT * FROM author', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/customers', (req, res) => {
  console.log('Fetching customers...');
  db.all(`
    SELECT c.*, cc.Email, cc.PhoneNumber
    FROM customer c
    LEFT JOIN customer_contact cc ON c.CustomerID = cc.CustomerID
  `, [], (err, rows) => {
    if (err) {
      console.error('Error fetching customers:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    console.log(`Found ${rows.length} customers`);
    res.json(rows);
  });
});

app.get('/api/orders', (req, res) => {
  // First, get all orders with customer details
  db.all(`
    SELECT o.*, c.Name as CustomerName
    FROM customer_order o
    LEFT JOIN customer c ON o.CustomerID = c.CustomerID
  `, [], (err, orders) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // If no orders, return empty array
    if (orders.length === 0) {
      res.json([]);
      return;
    }

    // Get all order items to calculate totals
    db.all(`
      SELECT OrderID, Quantity, Price
      FROM orderItem
    `, [], (err, orderItems) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Calculate order totals
      const orderTotals = {};
      orderItems.forEach(item => {
        const { OrderID, Quantity, Price } = item;
        if (!orderTotals[OrderID]) {
          orderTotals[OrderID] = 0;
        }
        orderTotals[OrderID] += Quantity * Price;
      });

      // Add order totals to orders
      const ordersWithTotals = orders.map(order => ({
        ...order,
        OrderTotal: orderTotals[order.OrderID] || 0
      }));

      console.log(`Returning ${ordersWithTotals.length} orders with calculated totals`);
      res.json(ordersWithTotals);
    });
  });
});

app.get('/api/order-items', (req, res) => {
  db.all(`
    SELECT oi.*, b.Title as BookTitle
    FROM orderItem oi
    LEFT JOIN book b ON oi.ISBN = b.ISBN
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/inventory', (req, res) => {
  db.all(`
    SELECT i.*, b.Title as BookTitle
    FROM inventory i
    LEFT JOIN book b ON i.ISBN = b.ISBN
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/book-demand', (req, res) => {
  db.all('SELECT * FROM bookDemand', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/profit-margins', (req, res) => {
  db.all('SELECT * FROM profitMargin', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new order
app.post('/api/orders', (req, res) => {
  const { CustomerID, items } = req.body;
  
  if (!CustomerID || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  // Log the received data to help with debugging
  console.log('Creating new order:', { CustomerID, itemCount: items.length });
  console.log('Order items:', JSON.stringify(items));

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    try {
      // Calculate order total
      let orderTotal = 0;
      items.forEach(item => {
        orderTotal += item.Price * item.Quantity;
      });

      // Generate a unique order ID with timestamp and random component
      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // Check the table structure first
      db.get("PRAGMA table_info(customer_order)", [], (err, tableInfo) => {
        if (err) {
          console.error('Error checking table structure:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        console.log('Table structure:', tableInfo);
        
        // Insert order - adjust the SQL to match the actual table structure
        // Try without the OrderTotal column first if it doesn't exist
        const sql = 'INSERT INTO customer_order (OrderID, CustomerID, OrderDate) VALUES (?, ?, CURRENT_DATE)';
        
        db.run(sql, [orderId, CustomerID], function(err) {
          if (err) {
            console.error('Error creating order:', err);
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          // Use Promise.all to handle all item insertions in parallel
          const itemPromises = items.map((item, index) => {
            return new Promise((resolve, reject) => {
              // Generate truly unique order item ID
              const orderItemId = `ITEM${Date.now()}${index}${Math.floor(Math.random() * 1000)}`;
              
              // First check if enough inventory is available
              db.get(
                'SELECT StockQuantity FROM inventory WHERE ISBN = ?',
                [item.ISBN],
                (err, row) => {
                  if (err) {
                    return reject(err);
                  }
                  
                  if (!row) {
                    // If no inventory record exists, create one with 0 quantity
                    console.log(`No inventory record for ISBN: ${item.ISBN}, creating one`);
                    db.run(
                      'INSERT INTO inventory (ISBN, StockQuantity) VALUES (?, 10)',
                      [item.ISBN],
                      (err) => {
                        if (err) return reject(err);
                        // Continue with order item creation with newly created inventory
                        insertOrderItem(orderItemId, orderId, item, resolve, reject);
                      }
                    );
                  } else if (row.StockQuantity < item.Quantity) {
                    return reject(new Error(`Insufficient inventory for book with ISBN ${item.ISBN}. Only ${row.StockQuantity} available.`));
                  } else {
                    // Continue with regular order item insertion
                    insertOrderItem(orderItemId, orderId, item, resolve, reject);
                  }
                }
              );
            });
          });

          // Function to insert order item and update inventory
          function insertOrderItem(orderItemId, orderId, item, resolve, reject) {
            // Insert order item
            db.run(
              'INSERT INTO orderItem (OrderItemID, OrderID, ISBN, Quantity, Price) VALUES (?, ?, ?, ?, ?)',
              [orderItemId, orderId, item.ISBN, item.Quantity, item.Price],
              function(err) {
                if (err) {
                  return reject(err);
                }

                // Update inventory
                db.run(
                  'UPDATE inventory SET StockQuantity = StockQuantity - ? WHERE ISBN = ?',
                  [item.Quantity, item.ISBN],
                  function(err) {
                    if (err) {
                      return reject(err);
                    }
                    resolve();
                  }
                );
              }
            );
          }

          // Handle all promises
          Promise.all(itemPromises)
            .then(() => {
              db.run('COMMIT', (err) => {
                if (err) {
                  console.error('Error committing transaction:', err);
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }
                console.log('Order created successfully:', orderId);
                res.status(201).json({
                  message: 'Order created successfully',
                  orderId: orderId
                });
              });
            })
            .catch((err) => {
              console.error('Error processing order items:', err);
              db.run('ROLLBACK');
              res.status(500).json({ error: err.message });
            });
        });
      });
    } catch (err) {
      console.error('Unexpected error in order creation:', err);
      db.run('ROLLBACK');
      res.status(500).json({ error: err.message });
    }
  });
});

// Update inventory
app.post('/api/inventory', (req, res) => {
  const { ISBN, StockQuantity } = req.body;
  
  if (!ISBN || typeof StockQuantity !== 'number' || StockQuantity < 0) {
    return res.status(400).json({ error: 'Invalid inventory data' });
  }

  db.run(
    'INSERT INTO inventory (ISBN, StockQuantity) VALUES (?, ?) ON CONFLICT(ISBN) DO UPDATE SET StockQuantity = ?',
    [ISBN, StockQuantity, StockQuantity],
    function(err) {
      if (err) {
        console.error('Error updating inventory:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ 
        message: 'Inventory updated successfully',
        ISBN: ISBN,
        StockQuantity: StockQuantity
      });
    }
  );
});

// Initialize inventory for all books
app.post('/api/init-inventory', (req, res) => {
  console.log('Initializing inventory for all books...');
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // First get all books that don't have inventory records
    db.all(`
      SELECT b.ISBN 
      FROM book b 
      LEFT JOIN inventory i ON b.ISBN = i.ISBN 
      WHERE i.ISBN IS NULL
    `, [], (err, books) => {
      if (err) {
        console.error('Error finding books without inventory:', err);
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }
      
      if (books.length === 0) {
        console.log('All books already have inventory records');
        return res.json({ message: 'All books already have inventory records' });
      }
      
      console.log(`Found ${books.length} books without inventory records`);
      
      // Create a default inventory entry for each book (10 items)
      const stmt = db.prepare('INSERT INTO inventory (ISBN, StockQuantity) VALUES (?, 10)');
      
      let completed = 0;
      books.forEach(book => {
        stmt.run(book.ISBN, function(err) {
          if (err) {
            console.error(`Error adding inventory for ${book.ISBN}:`, err);
          } else {
            completed++;
            console.log(`Added inventory for ${book.ISBN}, ${completed}/${books.length}`);
          }
          
          if (completed === books.length) {
            stmt.finalize();
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                return res.status(500).json({ error: err.message });
              }
              console.log(`Initialized inventory for ${completed} books`);
              res.json({ 
                message: `Initialized inventory for ${completed} books`,
                booksProcessed: completed
              });
            });
          }
        });
      });
    });
  });
});

// Reset database endpoint
app.post('/api/reset-db', (req, res) => {
  console.log('Resetting database...');
  
  // Read SQL files from parent directory
  const createSQL = fs.readFileSync(path.join(__dirname, '../sql_creates.sqlite'), 'utf8');
  const insertSQL = fs.readFileSync(path.join(__dirname, '../sql_inserts.sqlite'), 'utf8');

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Drop all existing tables
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        console.error('Error getting tables:', err);
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }

      // Drop each table
      tables.forEach(table => {
        db.run(`DROP TABLE IF EXISTS ${table.name}`);
      });

      // Create tables and insert data
      db.exec(createSQL, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        db.exec(insertSQL, (err) => {
          if (err) {
            console.error('Error inserting data:', err);
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }

          db.run('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction:', err);
              return res.status(500).json({ error: err.message });
            }
            console.log('Database reset successful');
            res.json({ message: 'Database reset successful' });
          });
        });
      });
    });
  });
});

// Create a new customer
app.post('/api/customers', (req, res) => {
  const { Name, Address, Email, PhoneNumber } = req.body;
  
  if (!Name || !Email || !PhoneNumber) {
    return res.status(400).json({ error: 'Name, Email, and Phone Number are required' });
  }
  
  console.log('Creating new customer:', { Name, Email, PhoneNumber });
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Generate a unique customer ID
    const customerID = `CUST${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    // Insert into customer table
    db.run(
      'INSERT INTO customer (CustomerID, Name, Address) VALUES (?, ?, ?)',
      [customerID, Name, Address || ''],
      function(err) {
        if (err) {
          console.error('Error creating customer:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        
        // Insert into customer_contact table
        db.run(
          'INSERT INTO customer_contact (CustomerID, Email, PhoneNumber) VALUES (?, ?, ?)',
          [customerID, Email, PhoneNumber],
          function(err) {
            if (err) {
              console.error('Error creating customer contact:', err);
              db.run('ROLLBACK');
              return res.status(500).json({ error: err.message });
            }
            
            db.run('COMMIT', (err) => {
              if (err) {
                console.error('Error committing transaction:', err);
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
              }
              
              console.log('Customer created successfully:', customerID);
              res.status(201).json({
                message: 'Customer created successfully',
                customerID: customerID
              });
            });
          }
        );
      }
    );
  });
});

// Create a new author
app.post('/api/authors', (req, res) => {
  const { Name } = req.body;
  
  if (!Name) {
    return res.status(400).json({ error: 'Author name is required' });
  }
  
  console.log('Creating new author:', { Name });
  
  // Generate a unique author ID
  const authorID = `AUTH${Date.now()}${Math.floor(Math.random() * 1000)}`;
  
  db.run(
    'INSERT INTO author (AuthorID, Name) VALUES (?, ?)',
    [authorID, Name],
    function(err) {
      if (err) {
        console.error('Error creating author:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('Author created successfully:', authorID);
      res.status(201).json({
        message: 'Author created successfully',
        authorID: authorID
      });
    }
  );
});

// Get all categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM category', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get all publishers
app.get('/api/publishers', (req, res) => {
  db.all('SELECT * FROM publisher', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new book
app.post('/api/books', (req, res) => {
  const { ISBN, Title, Year, Price, PublisherID, CategoryID, AuthorIDs } = req.body;
  
  if (!ISBN || !Title || !Price || !CategoryID || !PublisherID || !AuthorIDs || AuthorIDs.length === 0) {
    return res.status(400).json({ error: 'ISBN, Title, Price, CategoryID, PublisherID, and at least one AuthorID are required' });
  }
  
  console.log('Creating new book:', { ISBN, Title, Year, AuthorIDs });
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    // Insert into book table
    db.run(
      'INSERT INTO book (ISBN, Title, Year, Price, PublisherID, CategoryID) VALUES (?, ?, ?, ?, ?, ?)',
      [ISBN, Title, Year || null, Price, PublisherID, CategoryID],
      function(err) {
        if (err) {
          console.error('Error creating book:', err);
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        
        // Associate book with authors
        const authorPromises = AuthorIDs.map(authorID => {
          return new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO book_author (ISBN, AuthorID) VALUES (?, ?)',
              [ISBN, authorID],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });
        });
        
        Promise.all(authorPromises)
          .then(() => {
            // Create initial inventory for this book
            db.run(
              'INSERT INTO inventory (ISBN, StockQuantity) VALUES (?, ?)',
              [ISBN, 10],
              function(err) {
                if (err) {
                  console.error('Error creating inventory:', err);
                  db.run('ROLLBACK');
                  return res.status(500).json({ error: err.message });
                }
                
                // Create empty records for profit margin and book demand
                db.run(
                  'INSERT INTO profitMargin (ISBN, SalesTotal, CostTotal) VALUES (?, 0, 0)',
                  [ISBN],
                  function(err) {
                    if (err) {
                      console.error('Error creating profit margin:', err);
                      db.run('ROLLBACK');
                      return res.status(500).json({ error: err.message });
                    }
                    
                    db.run(
                      'INSERT INTO bookDemand (ISBN, Popularity) VALUES (?, 0)',
                      [ISBN],
                      function(err) {
                        if (err) {
                          console.error('Error creating book demand:', err);
                          db.run('ROLLBACK');
                          return res.status(500).json({ error: err.message });
                        }
                        
                        db.run('COMMIT', (err) => {
                          if (err) {
                            console.error('Error committing transaction:', err);
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: err.message });
                          }
                          
                          console.log('Book created successfully:', ISBN);
                          res.status(201).json({
                            message: 'Book created successfully',
                            ISBN: ISBN
                          });
                        });
                      }
                    );
                  }
                );
              }
            );
          })
          .catch((err) => {
            console.error('Error associating book with authors:', err);
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          });
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});