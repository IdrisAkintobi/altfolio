import app from "./app.js";
import { config } from "./config/env.js";
import { connectDB, Database } from "./db/connection.js";
import { logger } from "./utils/index.js";

let server: any;
const SHUTDOWN_TIMEOUT_MS = 10_000;

async function startServer() {
  try {
    await connectDB();
    server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.fatal("Failed to start server", error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, starting graceful shutdown`);

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed");

      try {
        const db = Database.getInstance();
        await db.disconnect();
        process.exit(0);
      } catch (error) {
        logger.error("Error during shutdown", error);
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error: Error) => {
  logger.fatal("Uncaught Exception", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason: any) => {
  logger.fatal("Unhandled Rejection", reason);
  gracefulShutdown("unhandledRejection");
});

startServer();
