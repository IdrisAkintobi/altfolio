import pino from "pino";
import { config } from "../config/env.js";

export class AppLogger {
  private static instance: AppLogger;
  private readonly logger: pino.Logger;

  private constructor(existing?: pino.Logger) {

    this.logger = existing ?? pino({
      level: config.logLevel || (config.isProd ? "info" : "debug"),
      transport: config.isDev
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

  private child(bindings: Record<string, any>): AppLogger {
    return new AppLogger(this.logger.child(bindings));
  }

  public createModuleLogger(name: string): AppLogger {
    return this.child({module: name})
  }
}

export const logger = AppLogger.getInstance();
