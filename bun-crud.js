// bun-crud.js
// Bun CRUD app using built-in SQLite and HTTP server

import { Database } from "bun:sqlite";

// Initialize SQLite database and create table if it doesn't exist
const db = new Database("database.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT
  )
`);

// GET /items - Retrieve all items
// POST /items - Create a new item
// GET /items/:id - Retrieve a single item by ID
// PUT /items/:id - Update an existing item
// DELETE /items/:id - Delete an item
// Additional endpoints: /items/search, /items/bulk, /items/complex

Bun.serve({
  port: 4001,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // Helper function to send JSON responses
    const jsonResponse = (data, init = {}) =>
      new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" }, ...init });

    // Route: GET /items
    if (pathname === "/items" && method === "GET") {
      const stmt = db.prepare("SELECT * FROM items");
      const items = stmt.all();
      return jsonResponse(items);
    }

    // Route: GET /items/:id
    if (pathname.startsWith("/items/") && method === "GET" && !pathname.includes("search") && !pathname.includes("complex")) {
      const parts = pathname.split("/");
      const id = parts[2];
      const stmt = db.prepare("SELECT * FROM items WHERE id = ?");
      const item = stmt.get(id);
      if (item) return jsonResponse(item);
      else return jsonResponse({ error: "Item not found" }, { status: 404 });
    }

    // Route: POST /items
    if (pathname === "/items" && method === "POST") {
      const body = await request.json();
      const { name, description } = body;
      const stmt = db.prepare("INSERT INTO items (name, description) VALUES (?, ?)");
      const info = stmt.run(name, description);
      return jsonResponse({ id: info.lastInsertRowid, name, description });
    }

    // Route: PUT /items/:id
    if (pathname.startsWith("/items/") && method === "PUT") {
      const parts = pathname.split("/");
      const id = parts[2];
      const body = await request.json();
      const { name, description } = body;
      const stmt = db.prepare("UPDATE items SET name = ?, description = ? WHERE id = ?");
      const info = stmt.run(name, description, id);
      if (info.changes > 0) return jsonResponse({ id, name, description });
      else return jsonResponse({ error: "Item not found" }, { status: 404 });
    }

    // Route: DELETE /items/:id
    if (pathname.startsWith("/items/") && method === "DELETE") {
      const parts = pathname.split("/");
      const id = parts[2];
      const stmt = db.prepare("DELETE FROM items WHERE id = ?");
      const info = stmt.run(id);
      if (info.changes > 0) return jsonResponse({ success: true });
      else return jsonResponse({ error: "Item not found" }, { status: 404 });
    }

    // Route: GET /items/search?term=...
    if (pathname === "/items/search" && method === "GET") {
      const term = url.searchParams.get("term") || "";
      const searchTerm = `%${term}%`;
      const stmt = db.prepare("SELECT * FROM items WHERE name LIKE ? OR description LIKE ?");
      const items = stmt.all(searchTerm, searchTerm);
      return jsonResponse(items);
    }

    // Route: POST /items/bulk - Bulk insert multiple items
    if (pathname === "/items/bulk" && method === "POST") {
      const items = await request.json();
      if (!Array.isArray(items)) {
        return jsonResponse({ error: "Expected an array of items" }, { status: 400 });
      }
      const stmt = db.prepare("INSERT INTO items (name, description) VALUES (?, ?)");
      // Execute within a transaction
      db.exec("BEGIN");
      try {
        for (const item of items) {
          stmt.run(item.name, item.description);
        }
        db.exec("COMMIT");
        return jsonResponse({ success: true, inserted: items.length });
      } catch (err) {
        db.exec("ROLLBACK");
        return jsonResponse({ error: err.message }, { status: 500 });
      }
    }

    // Route: GET /items/complex - Perform multiple queries and aggregate results
    if (pathname === "/items/complex" && method === "GET") {
      try {
        const count = db.prepare("SELECT COUNT(*) as total FROM items").get().total;
        const avgNameLength = db.prepare("SELECT AVG(LENGTH(name)) as avgNameLength FROM items").get().avgNameLength;
        const topItems = db.prepare("SELECT * FROM items ORDER BY id DESC LIMIT 5").all();
        return jsonResponse({
          totalItems: count,
          avgNameLength: avgNameLength,
          topItems: topItems
        });
      } catch (err) {
        return jsonResponse({ error: err.message }, { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  }
});
