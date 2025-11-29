import pino from "pino";
import { config } from "../config/env.js";

export class AppLogger {
  private static instance: AppLogger;
  private readonly logger: pino.Logger;

  private constructor() {
    const isDevelopment = config.nodeEnv !== "production";
    const isProduction = config.nodeEnv === "production";

    this.logger = pino({
      level: config.logLevel || (isProduction ? "info" : "debug"),
      transport: isDevelopment
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "HH:MM:ss Z",
              ignore: "pid,hostname",
              singleLine: false,
            },
          }
        : undefined,
      formatters: {
        level: (label) => {
          return { level: label.toUpperCase() };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      // Production-specific settings
      ...(isProduction && {
        base: {
          env: config.nodeEnv,
        },
      }),
    });
  }

  public static getInstance(): AppLogger {
    if (!AppLogger.instance) {
      AppLogger.instance = new AppLogger();
    }
    return AppLogger.instance;
  }

  public info(message: string, meta?: Record<string, any>): void {
    this.logger.info(meta, message);
  }

  public error(
    message: string,
    error?: Error,
    meta?: Record<string, any>
  ): void {
    const errorMeta =
      error instanceof Error
        ? {
            ...meta,
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
          }
        : { ...meta, error };

    this.logger.error(errorMeta, message);
  }

  public warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(meta, message);
  }

  public debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(meta, message);
  }

  public fatal(
    message: string,
    error?: Error,
    meta?: Record<string, any>
  ): void {
    const errorMeta =
      error instanceof Error
        ? {
            ...meta,
            error: {
              message: error.message,
              stack: error.stack,
              name: error.name,
            },
          }
        : { ...meta, error };

    this.logger.fatal(errorMeta, message);
  }

  public child(bindings: Record<string, any>): pino.Logger {
    return this.logger.child(bindings);
  }
}

// Export singleton instance (lazy initialized on first access)
export const logger = AppLogger.getInstance();
