// node-crud.js
const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const port = 4000;

app.use(express.json());

// Initialize SQLite database and create tables if they don't exist
const db = new Database('database.db');

// Main items table
db.prepare(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT
  )
`).run();

// (Optional) Create an additional table for demonstration if needed
// db.prepare(`CREATE TABLE IF NOT EXISTS details (id INTEGER PRIMARY KEY, itemId INTEGER, info TEXT)`).run();

// GET /items - Retrieve all items
app.get('/items', (req, res) => {
  const items = db.prepare('SELECT * FROM items').all();
  res.json(items);
});

// GET /items/:id - Retrieve a single item by ID
app.get('/items/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM items WHERE id = ?');
  const item = stmt.get(req.params.id);
  if (item) res.json(item);
  else res.status(404).json({ error: 'Item not found' });
});

// POST /items - Create a new item
app.post('/items', (req, res) => {
  const { name, description } = req.body;
  const stmt = db.prepare('INSERT INTO items (name, description) VALUES (?, ?)');
  const info = stmt.run(name, description);
  res.json({ id: info.lastInsertRowid, name, description });
});

// PUT /items/:id - Update an existing item
app.put('/items/:id', (req, res) => {
  const { name, description } = req.body;
  const stmt = db.prepare('UPDATE items SET name = ?, description = ? WHERE id = ?');
  const info = stmt.run(name, description, req.params.id);
  if (info.changes > 0) res.json({ id: req.params.id, name, description });
  else res.status(404).json({ error: 'Item not found' });
});

// DELETE /items/:id - Delete an item
app.delete('/items/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM items WHERE id = ?');
  const info = stmt.run(req.params.id);
  if (info.changes > 0) res.json({ success: true });
  else res.status(404).json({ error: 'Item not found' });
});

// GET /items/search - Search items by term in name or description
app.get('/items/search', (req, res) => {
  const term = req.query.term || '';
  const stmt = db.prepare(`
    SELECT * FROM items
    WHERE name LIKE ? OR description LIKE ?
  `);
  const searchTerm = `%${term}%`;
  const items = stmt.all(searchTerm, searchTerm);
  res.json(items);
});

// POST /items/bulk - Bulk insert multiple items in one transaction
app.post('/items/bulk', (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Expected an array of items' });
  }
  const insert = db.prepare('INSERT INTO items (name, description) VALUES (?, ?)');
  const transaction = db.transaction((items) => {
    for (const item of items) {
      insert.run(item.name, item.description);
    }
  });
  try {
    transaction(items);
    res.json({ success: true, inserted: items.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /items/complex - Perform multiple queries and aggregate results
app.get('/items/complex', (req, res) => {
  try {
    // Count total items
    const count = db.prepare('SELECT COUNT(*) as total FROM items').get().total;
    // Calculate average length of name
    const avgNameLength = db.prepare('SELECT AVG(LENGTH(name)) as avgNameLength FROM items').get().avgNameLength;
    // Get top 5 items sorted by id descending
    const topItems = db.prepare('SELECT * FROM items ORDER BY id DESC LIMIT 5').all();
    
    res.json({
      totalItems: count,
      avgNameLength: avgNameLength,
      topItems: topItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Node.js CRUD app listening at http://localhost:${port}`);
});
