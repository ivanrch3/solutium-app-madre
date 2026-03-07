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
  app.use(express.json());

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

  // Admin Invitation API
  app.post("/api/admin/invite", async (req, res) => {
    const { email, role, name } = req.body;
    let supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseUrl.startsWith('sb_publishable_')) {
      supabaseUrl = 'https://zzysjtxnbzquufajtqgf.supabase.co';
    } else if (!supabaseUrl || supabaseUrl === 'undefined') {
      supabaseUrl = 'https://zzysjtxnbzquufajtqgf.supabase.co';
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: "Supabase configuration missing on server" });
    }

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        data: { 
          full_name: name,
          role: role || 'user'
        },
        // Redirect to the app URL after confirmation
        redirectTo: process.env.APP_URL || "http://localhost:3000"
      });

      if (error) throw error;
      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Invitation error:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Update User Role API
  app.post("/api/admin/update-role", async (req, res) => {
    const { userId, newRole } = req.body;
    let supabaseUrl = process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseUrl.startsWith('sb_publishable_')) {
      supabaseUrl = 'https://zzysjtxnbzquufajtqgf.supabase.co';
    } else if (!supabaseUrl || supabaseUrl === 'undefined') {
      supabaseUrl = 'https://zzysjtxnbzquufajtqgf.supabase.co';
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: "Supabase configuration missing on server" });
    }

    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Update the role in the profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Also update the role in the auth metadata so it's available on next login
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { user_metadata: { role: newRole } }
      );

      if (authError) throw authError;

      res.json({ success: true });
    } catch (error: any) {
      console.error("Update role error:", error);
      res.status(400).json({ error: error.message });
    }
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
    
    // Catch-all fallback for SPA - Using middleware instead of a route string
    // to avoid Express 5 path-to-regexp wildcard errors
    app.use((_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
