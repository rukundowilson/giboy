const express = require('express');
const app = express();
const routes = require('./routes/index');
const db = require('./config/db');


app.use(express.json());

app.use("/", routes);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Giboy server running on http://localhost:${PORT}`);
});
