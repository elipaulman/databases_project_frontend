const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, '../bookstore.db'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// API Endpoints
app.get('/api/books', (req, res) => {
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
      res.status(500).json({ error: err.message });
      return;
    }
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
  db.all('SELECT * FROM customer', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 