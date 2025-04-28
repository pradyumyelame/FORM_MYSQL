const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const port = 3002;

// Enable CORS
app.use(cors());

// Middleware to parse JSON data
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "22510063", // update with your MySQL password
  database: "countries_db",   // your MySQL database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// API Route to insert country data
app.post("/submit", (req, res) => {
  const { country, capital, population } = req.body;

  const query = "INSERT INTO countries (country, capital, population) VALUES (?, ?, ?)";
  db.query(query, [country, capital, population], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      res.status(500).json({ error: "Error inserting data" });
    } else {
      res.status(200).json({ message: "Data inserted successfully" });
    }
  });
});

// API Route to fetch all countries
app.get("/countries", (req, res) => {
  const query = "SELECT country, capital, population FROM countries";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching countries:", err);
      res.status(500).json({ error: "Error fetching countries" });
    } else {
      res.status(200).json(results);
    }
  });
});

// API Route to delete a country
app.delete("/countries/:country", (req, res) => {
  const { country } = req.params;

  if (!country) {
    console.error("Invalid or missing country:", country);
    return res.status(400).json({ error: "Invalid or missing country" });
  }

  const query = "DELETE FROM countries WHERE country = ?";
  db.query(query, [country], (err) => {
    if (err) {
      console.error("Error deleting country:", err);
      return res.status(500).json({ error: "Error deleting country" });
    }
    res.status(200).json({ message: "Country deleted successfully" });
  });
});

// API Route to update a country
app.put("/countries/:country", (req, res) => {
  const { country } = req.params;
  const { newCountry, capital, population } = req.body;

  if (!country || (!newCountry && !capital && !population)) {
    console.error("Invalid or missing parameters:", req.body);
    return res.status(400).json({ error: "Invalid or missing parameters" });
  }

  const query = "UPDATE countries SET country = ?, capital = ?, population = ? WHERE country = ?";
  db.query(query, [newCountry || country, capital, population, country], (err, result) => {
    if (err) {
      console.error("Error updating country:", err);
      return res.status(500).json({ error: "Error updating country" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Country not found" });
    }
    res.status(200).json({ message: "Country updated successfully" });
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
