import cors from "cors";
import express, { Express } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || [];

export function applyMiddleware(app: Express): void {
  // CORS middleware
  app.use(
    cors({
      origin: ALLOWED_ORIGINS,
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
  );

  // JSON body parser
  app.use(express.json());

  // Serve static frontend files
  const clientBuildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuildPath));
}
