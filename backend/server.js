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
  db.all('SELECT * FROM customer', [], (err, rows) => {
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
  db.all(`
    SELECT o.*, c.Name as CustomerName
    FROM customer_order o
    LEFT JOIN customer c ON o.CustomerID = c.CustomerID
  `, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
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

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Calculate order total
    let orderTotal = 0;
    items.forEach(item => {
      orderTotal += item.Price * item.Quantity;
    });

    // Insert order
    const orderId = `ORD${Date.now()}`;
    db.run(
      'INSERT INTO customer_order (OrderID, CustomerID, OrderDate, OrderTotal) VALUES (?, ?, CURRENT_DATE, ?)',
      [orderId, CustomerID, orderTotal],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          console.error('Error creating order:', err);
          return res.status(500).json({ error: err.message });
        }

        // Insert order items and update inventory
        let completed = 0;
        items.forEach(item => {
          const orderItemId = `ITEM${Date.now()}${completed}`;
          
          // Insert order item
          db.run(
            'INSERT INTO orderItem (OrderItemID, OrderID, ISBN, Quantity, Price) VALUES (?, ?, ?, ?, ?)',
            [orderItemId, orderId, item.ISBN, item.Quantity, item.Price],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                console.error('Error creating order item:', err);
                return res.status(500).json({ error: err.message });
              }

              // Update inventory
              db.run(
                'UPDATE inventory SET StockQuantity = StockQuantity - ? WHERE ISBN = ? AND StockQuantity >= ?',
                [item.Quantity, item.ISBN, item.Quantity],
                function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    console.error('Error updating inventory:', err);
                    return res.status(500).json({ error: err.message });
                  }

                  completed++;
                  if (completed === items.length) {
                    db.run('COMMIT');
                    res.status(201).json({ 
                      message: 'Order created successfully',
                      orderId: orderId
                    });
                  }
                }
              );
            }
          );
        });
      }
    );
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 