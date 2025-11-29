import app from "./app.js";
import { config } from "./config/env.js";
import { connectDB } from "./db/connection.js";
import { logger } from "./utils/index.js";

// Start Server
if (config.nodeEnv !== "test") {
  try {
    await connectDB();
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.fatal("Failed to start server", error);
    process.exit(1);
  }
}
