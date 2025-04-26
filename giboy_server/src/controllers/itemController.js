import { db } from "../config/database"; 
import multer from "multer";
import path from "path";

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // you must create this folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({ storage: storage });

// Controller to add new item
export const addItem = (req, res) => {
  const { name, description, price } = req.body;
  const image = req.file ? req.file.filename : null; // multer will add file info

  if (!name || !price || !image) {
    return res.status(400).json({ message: "Name, price, and image are required." });
  }

  const sql = `
    INSERT INTO items (name, description, price, image_url)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, description, price, image], (err, result) => {
    if (err) {
      console.error("Error inserting item:", err);
      return res.status(500).json({ message: "Server error." });
    }

    return res.status(201).json({ message: "Item added successfully!", itemId: result.insertId });
  });
};
