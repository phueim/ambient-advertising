import dotenv from "dotenv";
import path from "path";
// Load environment variables first - make sure to load from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupAuth } from "./auth";

const app = express();

// Add CORS headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:5000');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Cookie');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));

// Setup authentication before routes
setupAuth(app);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Serve audio files statically
app.use('/audio', express.static('public/audio'));

(async () => {
  // Initialize database with sample data on startup
  const { seedDatabase } = await import("./seedData");
  const { WorkerManager } = await import("./workers/workerManager");
  
  console.log("🔧 Initializing Ambient Advertising System...");
  
  // Seed database with intelligent checking
  try {
    await seedDatabase();
  } catch (error) {
    console.error("❌ Database seeding failed:", error.message);
  }

  // Seed contract system with intelligent checking
  try {
    const { seedContractSystem } = await import("./contractSeedData");
    await seedContractSystem();
  } catch (error) {
    console.error("❌ Contract system seeding failed:", error.message);
  }
  
  // Initialize worker manager (TEMPORARILY DISABLED)
  try {
    const workerManager = new WorkerManager();
    // DISABLED: Workers temporarily stopped to prevent automatic generation
    // await workerManager.startAllWorkers({
    //   dataIngestionInterval: 5, // 5 minutes - keep data fresh
    //   triggerEngineInterval: 60  // 60 minutes (1 hour) - reduce script generation frequency
    // });
    
    // Make worker manager available globally for routes (but not started)
    (global as any).workerManager = workerManager;
    console.log("ℹ️  Worker manager created but NOT started (temporarily disabled)");
  } catch (error) {
    console.error("❌ Failed to initialize worker manager:", error);
    // Create a minimal worker manager for API compatibility
    (global as any).workerManager = null;
  }
  
  console.log("✅ System initialization complete!");

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
