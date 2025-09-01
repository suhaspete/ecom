const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT ci.*, p.name, p.description, p.price, p.image_url 
     FROM cart_items ci 
     JOIN products p ON ci.product_id = p.id 
     WHERE ci.user_id = ?`,
    [userId],
    (err, items) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching cart items' });
      }
      res.json(items);
    }
  );
});

router.post('/add', authenticateToken, (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.user.id;

  if (!product_id || !quantity) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  db.get(
    'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
    [userId, product_id],
    (err, existingItem) => {
      if (err) {
        return res.status(500).json({ message: 'Error checking cart' });
      }

      if (existingItem) {
        db.run(
          'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
          [quantity, existingItem.id],
          (err) => {
            if (err) {
              return res.status(500).json({ message: 'Error updating cart' });
            }
            res.json({ message: 'Cart updated successfully' });
          }
        );
      } else {
        db.run(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, product_id, quantity],
          function(err) {
            if (err) {
              return res.status(500).json({ message: 'Error adding to cart' });
            }
            res.status(201).json({ 
              message: 'Item added to cart',
              cartItemId: this.lastID 
            });
          }
        );
      }
    }
  );
});

router.put('/update/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const userId = req.user.id;

  if (quantity <= 0) {
    return res.status(400).json({ message: 'Quantity must be greater than 0' });
  }

  db.run(
    'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
    [quantity, id, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating cart item' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      res.json({ message: 'Cart item updated successfully' });
    }
  );
});

router.delete('/remove/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.run(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
    [id, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error removing cart item' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      res.json({ message: 'Item removed from cart' });
    }
  );
});

router.delete('/clear', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.run(
    'DELETE FROM cart_items WHERE user_id = ?',
    [userId],
    (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error clearing cart' });
      }
      res.json({ message: 'Cart cleared successfully' });
    }
  );
});

module.exports = router;