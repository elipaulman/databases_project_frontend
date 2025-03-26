const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create a new database connection
const db = new sqlite3.Database(path.join(__dirname, '../bookstore.db'), (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to SQLite database');
});

// Promise wrapper for db.run
const runQuery = (sql) => {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) {
        console.error('Error executing SQL:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Drop existing tables
const dropTables = async () => {
  const tables = [
    'profitMargin',
    'bookDemand',
    'customer_order',
    'inventory',
    'orderItem',
    'customer',
    'book_author',
    'book',
    'author',
    'publisher',
    'category'
  ];

  for (const table of tables) {
    try {
      await runQuery(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped table ${table}`);
    } catch (err) {
      console.error(`Error dropping table ${table}:`, err);
    }
  }
};

// Read and execute SQL files
const executeSqlFile = async (filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = sql.split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  for (const statement of statements) {
    try {
      await runQuery(statement);
    } catch (err) {
      console.error(`Error executing statement: ${statement}`);
      console.error(err);
    }
  }
};

// Execute both SQL files
const initializeDatabase = async () => {
  try {
    console.log('Dropping existing tables...');
    await dropTables();
    
    console.log('Creating database schema...');
    await executeSqlFile(path.join(__dirname, '../sql_creates.sqlite'));
    
    console.log('Populating database with data...');
    await executeSqlFile(path.join(__dirname, '../sql_inserts.sqlite'));
    
    console.log('Database initialization completed');
  } catch (err) {
    console.error('Error during database initialization:', err);
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
    });
  }
};

// Run the initialization
initializeDatabase(); 