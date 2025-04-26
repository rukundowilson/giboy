const pool = require('../config/db'); // make sure this is your db pool connection

// Query to get user by email
exports.getUserByEmail = async (email) => {
    console.log("email to",email)
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log("getUserByEmail result:", rows); // 🔍 See what’s coming from DB
    return rows[0];
  };
  
