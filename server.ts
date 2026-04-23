import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log("Starting server initialization...");
  const app = express();
  const PORT = 3000;

  // Supabase Setup
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://xqikzccsnzelpumevmxo.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxaWt6Y2NzbnplbHB1bWV2bXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NzA5NzUsImV4cCI6MjA5MjQ0Njk3NX0.bTwBIxc6bxkw4XNiucH6xRIHlw_HWbLvBHnl88DCx-s';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // API Route for Google Sheets Sync
  app.post("/api/sync-products", async (req, res) => {
    console.log("Request received at /api/sync-products");
    try {
      const { products } = req.body;

      if (!Array.isArray(products)) {
        console.error("Invalid products format received:", req.body);
        return res.status(400).json({ error: "Invalid format. Expected 'products' array." });
      }

      console.log(`Starting sync for ${products.length} products...`);

      const namesToKeep = products.map(p => p.name).filter(n => n);

      if (namesToKeep.length > 0) {
        // Delete products that are no longer in the list
        const { error: deleteError } = await supabase
          .from('productos')
          .delete()
          .not('name', 'in', namesToKeep);

        if (deleteError) {
          console.error("Error deleting old products:", deleteError);
        }

        // Upsert new/existing products
        const { error: upsertError } = await supabase
          .from('productos')
          .upsert(products, { onConflict: 'name' });

        if (upsertError) {
          console.error("Error upserting products:", upsertError);
          return res.status(500).json({ 
            error: "Failed to sync products. Ensure the 'name' column in Supabase has a UNIQUE constraint.", 
            details: upsertError.message 
          });
        }
        
        console.log("Sync successfully processed in Supabase.");
      } else {
        // If sheet is empty, clear all products
        const { error: clearError } = await supabase
          .from('productos')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all if ID is UUID
        
        if (clearError) {
           console.error("Error clearing products:", clearError);
           return res.status(500).json({ error: "Failed to clear products", details: clearError });
        }
      }

      res.status(200).json({ status: "success", message: "Sync completed successfully" });
    } catch (error: any) {
      console.error("Internal sync error:", error);
      res.status(500).json({ error: "Internal server error", message: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Vite middleware or Static files
  const isProd = process.env.NODE_ENV === "production";
  const distPath = path.join(process.cwd(), "dist");
  const distExists = fs.existsSync(distPath);

  if (!isProd || !distExists) {
    console.log("Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static files from dist...");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`--- SERVER ACTIVE ---`);
    console.log(`Port: ${PORT}`);
    console.log(`Endpoint: http://0.0.0.0:${PORT}/api/sync-products`);
    console.log(`---------------------`);
  });
}

startServer().catch((err) => {
  console.error("FATAL: Failed to start server", err);
});
