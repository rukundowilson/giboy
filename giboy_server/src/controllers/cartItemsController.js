// controllers/cartItemsController.js

const db = require('../config/db');

exports.addOrUpdateCartItem = async (req, res) => {
  const { user_id, item_id, quantity } = req.body;

  if (!user_id || !item_id || typeof quantity !== 'number') {
    return res.status(400).json({ message: 'Missing or invalid fields.' });
  }

  try {
    await db.query(`
      INSERT INTO cart_items (user_id, item_id, quantity)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
    `, [user_id, item_id, quantity]);

    res.status(200).json({ message: 'Cart item added or updated successfully.' });
  } catch (err) {
    console.error('Error saving cart item:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserCartItems = async (req, res) => {
  const { userId } = req.params;
  console.log(userId)
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT 
        ci.id AS cart_item_id,
        ci.item_id,
        ci.quantity,
        ci.added_at,
        i.name,
        i.description,
        i.price,
        i.size,
        i.category,
        i.image_url,
        i.in_stock
      FROM cart_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.user_id = ?
      ORDER BY ci.added_at DESC
    `, [userId]);

    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching cart items:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};


// (Optional) Delete a cart item
exports.deleteCartItem = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'Cart item ID is required.' });
  }

  try {
    await db.query('DELETE FROM cart_items WHERE id = ?', [id]);
    res.status(200).json({ message: 'Cart item deleted successfully.' });
  } catch (err) {
    console.error('Error deleting cart item:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
