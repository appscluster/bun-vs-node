// Bun CRUD app using built-in SQLite and HTTP server
import { Database } from 'bun:sqlite';

// Initialize SQLite database and create table if it doesn't exist
const db = new Database('database.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT
  )
`);

// HTTP server with CRUD endpoints
const server = Bun.serve({
  port: 4001,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // GET /items - Retrieve all items
    if (path === '/items' && method === 'GET') {
      const items = db.query('SELECT * FROM items').all();
      return new Response(JSON.stringify(items), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // GET /items/:id - Retrieve a single item by ID
    if (path.match(/^\/items\/\d+$/) && method === 'GET') {
      const id = path.split('/').pop();
      const item = db.query('SELECT * FROM items WHERE id = ?').get(id);
      
      if (!item) {
        return new Response(JSON.stringify({ error: 'Item not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify(item), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // POST /items - Create a new item
    if (path === '/items' && method === 'POST') {
      const data = await req.json();
      const { name, description } = data;
      
      const stmt = db.prepare('INSERT INTO items (name, description) VALUES (?, ?)');
      const info = stmt.run(name, description);
      
      return new Response(JSON.stringify({
        id: info.lastInsertRowid,
        name,
        description
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // PUT /items/:id - Update an existing item
    if (path.match(/^\/items\/\d+$/) && method === 'PUT') {
      const id = path.split('/').pop();
      const data = await req.json();
      const { name, description } = data;
      
      const stmt = db.prepare('UPDATE items SET name = ?, description = ? WHERE id = ?');
      const info = stmt.run(name, description, id);
      
      if (info.changes === 0) {
        return new Response(JSON.stringify({ error: 'Item not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({
        id: parseInt(id),
        name,
        description
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // DELETE /items/:id - Delete an item
    if (path.match(/^\/items\/\d+$/) && method === 'DELETE') {
      const id = path.split('/').pop();
      
      const stmt = db.prepare('DELETE FROM items WHERE id = ?');
      const info = stmt.run(id);
      
      if (info.changes === 0) {
        return new Response(JSON.stringify({ error: 'Item not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle 404 for unknown routes
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

console.log(`Bun CRUD app listening at http://localhost:${server.port}`);
