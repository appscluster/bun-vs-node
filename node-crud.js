const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const port = 3000;

app.use(express.json());

// Initialize SQLite database and create table if it doesn't exist
const db = new Database('database.db');
db.prepare(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT
  )
`).run();

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

app.listen(port, () => {
  console.log(`Node.js CRUD app listening at http://localhost:${port}`);
});
