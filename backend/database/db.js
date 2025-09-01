const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'ecommerce.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
      });

      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`, (err) => {
        if (err) reject(err);
      });

      db.run(`CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`, (err) => {
        if (err) reject(err);
      });

      db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        shipping_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`, (err) => {
        if (err) reject(err);
      });

      db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`, async (err) => {
        if (err) {
          reject(err);
        } else {
          await seedDatabase();
          resolve();
        }
      });
    });
  });
};

const seedDatabase = () => {
  return new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) as count FROM products", async (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row.count === 0) {
        const products = [
          { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones', price: 199.99, category: 'Electronics', image_url: 'https://via.placeholder.com/300', stock: 50 },
          { name: 'Smart Watch', description: 'Fitness tracker with heart rate monitor', price: 299.99, category: 'Electronics', image_url: 'https://via.placeholder.com/300', stock: 30 },
          { name: 'Laptop Stand', description: 'Adjustable aluminum laptop stand', price: 49.99, category: 'Accessories', image_url: 'https://via.placeholder.com/300', stock: 100 },
          { name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI', price: 79.99, category: 'Accessories', image_url: 'https://via.placeholder.com/300', stock: 75 },
          { name: 'Mechanical Keyboard', description: 'RGB backlit mechanical gaming keyboard', price: 149.99, category: 'Electronics', image_url: 'https://via.placeholder.com/300', stock: 40 },
          { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with precision tracking', price: 59.99, category: 'Electronics', image_url: 'https://via.placeholder.com/300', stock: 60 },
          { name: 'Phone Case', description: 'Protective phone case with shock absorption', price: 29.99, category: 'Accessories', image_url: 'https://via.placeholder.com/300', stock: 200 },
          { name: 'Portable Charger', description: '20000mAh portable power bank', price: 89.99, category: 'Electronics', image_url: 'https://via.placeholder.com/300', stock: 80 }
        ];

        const stmt = db.prepare("INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)");
        
        products.forEach(product => {
          stmt.run(product.name, product.description, product.price, product.category, product.image_url, product.stock);
        });
        
        stmt.finalize();
        console.log('Database seeded with sample products');
      }
      
      resolve();
    });
  });
};

module.exports = { db, initializeDatabase };