import dotenv from "dotenv";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, "../../.env"), quiet: true });

interface Config {
  readonly port: number;
  readonly nodeEnv: string;
  readonly isDev: boolean;
  readonly isProd: boolean;
  readonly allowedOrigins: readonly string[];
  readonly mongoUri: string;
  readonly logLevel: string;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
}

const REQUIRED_ENV_VAR = ["PORT", "NODE_ENV", "MONGO_URI", "JWT_SECRET"]

function validateEnv(): Config {
  const missing = REQUIRED_ENV_VAR.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  const port = Number.parseInt(process.env.PORT, 10);
  if (Number.isNaN(port)) {
    throw new TypeError("PORT must be a valid number");
  }

  return {
    port,
    nodeEnv: process.env.NODE_ENV,
    isDev: process.env.NODE_ENV === "development",
    isProd: process.env.NODE_ENV === "production",
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [],
    mongoUri: process.env.MONGO_URI,
    logLevel: process.env.LOG_LEVEL || "info",
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as const;
}

export const config = validateEnv();
