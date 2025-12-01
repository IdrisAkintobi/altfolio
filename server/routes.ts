import { Application, NextFunction, Request, Response } from 'express';
import express from 'express';
import path from 'node:path';
import assetRoutes from './modules/assets/assets.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import investmentRoutes from './modules/investments/investments.routes.js';
import userRoutes from './modules/users/users.routes.js';
import { ApiResponse, errorHandler, notFoundHandler } from './utils/index.js';
import { config } from './config/env.js';

export function configureRoutes(app: Application): void {
  // API Routes with /api/v1 prefix
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/assets', assetRoutes);
  app.use('/api/v1/investments', investmentRoutes);
  app.use('/api/v1/users', userRoutes);

  // Health Check
  app.get('/api/v1/health', (req: Request, res: Response) => {
    ApiResponse.success(
      res,
      {
        timestamp: new Date(),
        uptime: process.uptime(),
        environment: config.nodeEnv,
      },
      'Server is healthy'
    );
  });

  // Serve static frontend files with caching
  // process.cwd() always returns the project root directory
  const clientBuildPath = path.join(process.cwd(), 'client/dist');

  // Cache static assets aggressively (hashed filenames)
  app.use(
    '/assets',
    (req, res, next) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      next();
    },
    express.static(path.join(clientBuildPath, 'assets'))
  );

  // Serve other static files without long caching
  app.use(
    express.static(clientBuildPath, {
      maxAge: 0,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    })
  );

  // 404 Handler for API routes (must be before SPA fallback)
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      notFoundHandler(req, res, next);
    } else {
      next();
    }
  });

  // SPA fallback - serve index.html for all non-API routes
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });

  // Global Error Handling Middleware
  app.use(errorHandler);
}
