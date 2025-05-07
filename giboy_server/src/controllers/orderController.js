const db = require('../config/db');

exports.getAllOrderedItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        ci.id AS cart_item_id,
        ci.quantity,
        ci.status,
        ci.added_at,
        u.id AS user_id,
        u.username,
        u.email,
        i.id AS item_id,
        i.name AS item_name,
        i.price,
        i.image_url
      FROM cart_items ci
      JOIN users u ON ci.user_id = u.id
      JOIN items i ON ci.item_id = i.id
      WHERE ci.status = 'pending'
      ORDER BY ci.added_at DESC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error('Error fetching ordered items:', err);
    res.status(500).json({ message: 'Server error fetching ordered items.' });
  }
};
