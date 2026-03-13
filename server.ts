import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing!");
}

const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

app.use(express.json({ limit: "50mb" }));

// API Routes for Content
app.get("/api/content", async (req, res) => {
  try {
    const { data, error } = await supabase.from("content").select("key, value");
    
    if (error) throw error;

    const content: Record<string, any> = {};
    for (const row of (data || [])) {
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

app.post("/api/content", async (req, res) => {
  const { key, value } = req.body;
  if (!key) {
    return res.status(400).json({ error: "Key is required" });
  }

  try {
    const stringValue = typeof value === "string" ? value : JSON.stringify(value);
    
    const { error } = await supabase.from("content").upsert({ 
      key, 
      value: stringValue,
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' });
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving content:", error);
    res.status(500).json({ error: "Failed to save content" });
  }
});

// Setup multer for image uploads (Memory storage for Supabase)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// API Routes for Images
app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = fileName;

    // 1. Upload to Supabase Storage Bucket
    console.log(`Attempting upload of ${fileName} to site-images bucket...`);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("site-images")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error("Supabase Storage Upload Error (Full Details):", JSON.stringify(uploadError, null, 2));
      throw uploadError;
    }
    
    console.log("Upload successful:", uploadData);

    // 2. Get Public URL
    const { data: urlData } = supabase.storage
      .from("site-images")
      .getPublicUrl(filePath);
      
    const publicUrl = urlData.publicUrl;
    console.log("Generated Public URL:", publicUrl);

    // 3. Save reference to DB
    console.log("Saving to 'images' table...");
    const { data: dbData, error: dbError } = await supabase.from("images").insert({
      filename: file.originalname,
      url: publicUrl,
    }).select();

    if (dbError) {
      console.error("Supabase Database Insert Error (Full Details):", JSON.stringify(dbError, null, 2));
      throw dbError;
    }
    
    console.log("Database record created:", dbData);

    
    res.json({ url: publicUrl, filename: file.originalname });
  } catch (error) {
    console.error("Error saving image to Supabase:", error);
    res.status(500).json({ 
      error: "Failed to save image", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }

});

app.get("/api/images", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    res.json(data);
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

