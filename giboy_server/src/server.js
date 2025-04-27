const express = require('express');
const app = express();
const routes = require('./routes/index');
const db = require('./config/db');
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use(express.json());
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use("/", routes);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Giboy server running on http://localhost:${PORT}`);
});

