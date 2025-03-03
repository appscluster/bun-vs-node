// Bun CRUD app using built-in SQLite and HTTP server

// Initialize SQLite database and create table if it doesn't exist
const db = new SQLite("database.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT
  )
`);

Bun.serve({
  port: 3001,
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;

    // GET /items - Retrieve all items
    if (pathname === "/items" && method === "GET") {
      const stmt = db.prepare("SELECT * FROM items");
      const items = stmt.all();
      return new Response(JSON.stringify(items), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // POST /items - Create a new item
    if (pathname === "/items" && method === "POST") {
      const body = await request.json();
      const { name, description } = body;
      const stmt = db.prepare("INSERT INTO items (name, description) VALUES (?, ?)");
      const info = stmt.run(name, description);
      return new Response(
        JSON.stringify({ id: info.lastInsertRowid, name, description }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle routes with an ID (e.g., /items/1)
    if (pathname.startsWith("/items/")) {
      const id = pathname.split("/")[2];

      // GET /items/:id - Retrieve a single item by ID
      if (method === "GET") {
        const stmt = db.prepare("SELECT * FROM items WHERE id = ?");
        const item = stmt.get(id);
        if (item) {
          return new Response(JSON.stringify(item), {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify({ error: "Item not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // PUT /items/:id - Update an existing item
      if (method === "PUT") {
        const body = await request.json();
        const { name, description } = body;
        const stmt = db.prepare("UPDATE items SET name = ?, description = ? WHERE id = ?");
        const info = stmt.run(name, description, id);
        if (info.changes > 0) {
          return new Response(JSON.stringify({ id, name, description }), {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify({ error: "Item not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // DELETE /items/:id - Delete an item
      if (method === "DELETE") {
        const stmt = db.prepare("DELETE FROM items WHERE id = ?");
        const info = stmt.run(id);
        if (info.changes > 0) {
          return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } else {
          return new Response(JSON.stringify({ error: "Item not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }

    // If no matching route, return 404
    return new Response("Not Found", { status: 404 });
  }
});
