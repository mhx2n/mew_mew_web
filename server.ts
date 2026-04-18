import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import webhookHandler from "./api/webhook.ts";
import setupHandler from "./api/setup.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.use("/api", express.json());
  
  // Telegram Bot Routes
  app.post("/api/webhook", (req, res) => webhookHandler(req, res));
  app.get("/api/setup", (req, res) => setupHandler(req, res));
  
  // Health check endpoint for UptimeRobot
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Root endpoint for simple pings
  app.get("/", (req, res, next) => {
    // If it's a direct API call or ping, respond quickly
    if (req.headers['user-agent']?.includes('UptimeRobot') || req.query.ping) {
      return res.status(200).send("OK");
    }
    next();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("Frontend server started (Bot is now handled via Vercel Webhook)");
  });
}

startServer();
