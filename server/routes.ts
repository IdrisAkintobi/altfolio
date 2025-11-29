import { Application, NextFunction, Request, Response } from "express";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "./modules/auth/auth.routes.js";
import investmentRoutes from "./modules/investments/investments.routes.js";
import { ApiResponse, errorHandler, notFoundHandler } from "./utils/index.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function configureRoutes(app: Application): void {
  // API Routes with /api/v1 prefix
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/investments", investmentRoutes);

  // Health Check
  app.get("/api/v1/health", (req: Request, res: Response) => {
    ApiResponse.success(
      res,
      {
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      },
      "Server is healthy"
    );
  });

  // Serve static frontend files
  const clientBuildPath = path.join(__dirname, "../client/dist");
  app.use("/assets", (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=31536000");
    next();
  });

  // 404 Handler for API routes (must be before SPA fallback)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      notFoundHandler(req, res, next);
    } else {
      next();
    }
  });

  // SPA fallback - serve index.html for all non-API routes
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });

  // Global Error Handling Middleware
  app.use(errorHandler);
}
