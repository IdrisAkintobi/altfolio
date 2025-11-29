import express, { Express } from "express";

export function applyMiddleware(app: Express): void {
  // JSON body parser
  app.use(express.json());
}
