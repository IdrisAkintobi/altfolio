import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env file from root directory
  const env = loadEnv(mode, "..", "");

  return {
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: env.VITE_API_URL || "http://localhost:5001",
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: "dist",
    },
    plugins: [react()],
  };
});
