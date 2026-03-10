import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// Initialize SQLite database
const db = new Database("database.sqlite");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS content (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// API Routes for Content
app.get("/api/content", (req, res) => {
  try {
    const rows = db.prepare("SELECT key, value FROM content").all() as { key: string; value: string }[];
    const content: Record<string, any> = {};
    for (const row of rows) {
      try {
        content[row.key] = JSON.parse(row.value);
      } catch {
        content[row.key] = row.value;
      }
    }
    res.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    res.status(500).json({ error: "Failed to fetch content" });
  }
});

app.post("/api/content", (req, res) => {
  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Key is required" });
  }

  try {
    const stringValue = typeof value === "string" ? value : JSON.stringify(value);
    
    const stmt = db.prepare(`
      INSERT INTO content (key, value) 
      VALUES (?, ?) 
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);
    
    stmt.run(key, stringValue);
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving content:", error);
    res.status(500).json({ error: "Failed to save content" });
  }
});

// Setup multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// API Routes for Images
app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    const url = `/uploads/${req.file.filename}`;
    
    const stmt = db.prepare("INSERT INTO images (filename, url) VALUES (?, ?)");
    stmt.run(req.file.filename, url);
    
    res.json({ url, filename: req.file.filename });
  } catch (error) {
    console.error("Error saving image to db:", error);
    res.status(500).json({ error: "Failed to save image record" });
  }
});

app.get("/api/images", (req, res) => {
  try {
    const images = db.prepare("SELECT * FROM images ORDER BY created_at DESC").all();
    res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
