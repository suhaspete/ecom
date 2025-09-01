const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, search, sort } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (sort === 'price_asc') {
    query += ' ORDER BY price ASC';
  } else if (sort === 'price_desc') {
    query += ' ORDER BY price DESC';
  } else {
    query += ' ORDER BY created_at DESC';
  }

  db.all(query, params, (err, products) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching products' });
    }
    res.json(products);
  });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching product' });
    }
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { name, description, price, category, image_url, stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Name and price are required' });
  }

  db.run(
    'INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
    [name, description, price, category, image_url, stock || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating product' });
      }

      res.status(201).json({
        id: this.lastID,
        name,
        description,
        price,
        category,
        image_url,
        stock: stock || 0
      });
    }
  );
});

router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image_url, stock } = req.body;

  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ? WHERE id = ?',
    [name, description, price, category, image_url, stock, id],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating product' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product updated successfully' });
    }
  );
});

router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Error deleting product' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

module.exports = router;