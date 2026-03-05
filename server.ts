import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Validation of critical environment variables
  if (process.env.NODE_ENV === "production") {
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      console.warn("⚠️ WARNING: Supabase environment variables are missing!");
    }
  }

  app.use(cors());

  // API routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "Solutium Test Server is running" });
  });

  // Explicit route for manifest.json to ensure CORS and correct data
  app.get('/manifest.json', (_req, res) => {
    res.json({
      "id": "test-satellite",
      "name": "Servidor de Prueba",
      "description": "Aplicación satélite de prueba para validación de Handshake.",
      "version": "1.0.0",
      "category": "Productividad",
      "icon": "Box",
      "scopes": ["profile", "projectData"],
      "url": process.env.APP_URL || "http://localhost:3000",
      "logoUrl": ""
    });
  });

  // Example API for testing
  app.get("/api/test", (_req, res) => {
    res.json({ 
      timestamp: Date.now(),
      message: "Conexión exitosa con el servidor de prueba"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
