// Simple client-side logger
const isDevelopment = import.meta.env.DEV;

export const logger = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
    }
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
  },
  
  error: (message: string, data?: any) => {
    console.error(`[ERROR] ${message}`, data || '');
    // In production, errors should be sent to a service like Sentry
  },
  
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  },
};
