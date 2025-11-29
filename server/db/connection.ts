import mongoose from "mongoose";
import { logger } from "../utils/index.js";

export class Database {
  private static instance: Database;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info("Database already connected");
      return;
    }

    try {
      const mongoUri = process.env.MONGO_URI;
      const conn = await mongoose.connect(mongoUri);

      this.isConnected = true;
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      logger.fatal("Database connection error", error);
      process.exit(1);
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("MongoDB Disconnected");
    } catch (error) {
      logger.error("Database disconnection error", error);
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const connectDB = async (): Promise<void> => {
  const db = Database.getInstance();
  await db.connect();
};
