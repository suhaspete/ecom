const express = require('express');
const { db } = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, orders) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching orders' });
      }
      res.json(orders);
    }
  );
});

router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    [id, userId],
    (err, order) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching order' });
      }
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      db.all(
        `SELECT oi.*, p.name, p.description, p.image_url 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ message: 'Error fetching order items' });
          }
          res.json({ ...order, items });
        }
      );
    }
  );
});

router.post('/create', authenticateToken, (req, res) => {
  const { shipping_address } = req.body;
  const userId = req.user.id;

  db.all(
    `SELECT ci.*, p.price, p.stock 
     FROM cart_items ci 
     JOIN products p ON ci.product_id = p.id 
     WHERE ci.user_id = ?`,
    [userId],
    (err, cartItems) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching cart' });
      }

      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        db.run(
          'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
          [userId, totalAmount, shipping_address, 'pending'],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              return res.status(500).json({ message: 'Error creating order' });
            }

            const orderId = this.lastID;
            const stmt = db.prepare(
              'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
            );

            let error = false;
            cartItems.forEach(item => {
              stmt.run(orderId, item.product_id, item.quantity, item.price, (err) => {
                if (err) error = true;
              });
            });

            stmt.finalize(() => {
              if (error) {
                db.run('ROLLBACK');
                return res.status(500).json({ message: 'Error adding order items' });
              }

              const updateStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?');
              
              cartItems.forEach(item => {
                updateStmt.run(item.quantity, item.product_id, item.quantity, (err) => {
                  if (err) error = true;
                });
              });

              updateStmt.finalize(() => {
                if (error) {
                  db.run('ROLLBACK');
                  return res.status(500).json({ message: 'Insufficient stock for some items' });
                }

                db.run('DELETE FROM cart_items WHERE user_id = ?', [userId], (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: 'Error clearing cart' });
                  }

                  db.run('COMMIT');
                  res.status(201).json({ 
                    message: 'Order created successfully',
                    orderId: orderId,
                    totalAmount: totalAmount
                  });
                });
              });
            });
          }
        );
      });
    }
  );
});

router.put('/:id/status', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  db.run(
    'UPDATE orders SET status = ? WHERE id = ? AND user_id = ?',
    [status, id, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating order status' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json({ message: 'Order status updated successfully' });
    }
  );
});

module.exports = router;