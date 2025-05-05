const db = require('../config/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

exports.upload = multer({ storage: storage });

exports.addItem = (req, res) => {
  const { name, description, price, size, category, inStock } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price || !image) {
    return res.status(400).json({ message: "Name, price, and image are required." });
  }

  const sql = `
    INSERT INTO items (name, description, price, image_url, size, category, in_stock)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [name, description, price, image, size, category, inStock], (err, result) => {
    if (err) {
      console.error("Error inserting item:", err);
      return res.status(500).json({ message: "Server error." });
    }

    // Fetch the newly inserted item
    const fetchSql = 'SELECT * FROM items WHERE id = ?';
    db.query(fetchSql, [result.insertId], (fetchErr, fetchResult) => {
      if (fetchErr) {
        console.error("Error fetching new item:", fetchErr);
        return res.status(500).json({ message: "Server error." });
      }

      return res.status(201).json({ message: "Item added successfully!", item: fetchResult[0] });
    });
  });
};

exports.getAllItems = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM items ORDER BY items.created_at DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};
