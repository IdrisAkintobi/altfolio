import express from "express";
import { applyMiddleware } from "./middleware/middleware.js";
import { configureRoutes } from "./routes.js";

const app = express();

// Apply all middleware
applyMiddleware(app);

// Configure all routes
configureRoutes(app);

export default app;
