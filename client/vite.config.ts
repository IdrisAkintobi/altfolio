import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file from root directory
  const env = loadEnv(mode, '..', '');

  return {
    root: path.resolve(__dirname),
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_DEV_API_URL,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@shared': path.resolve(__dirname, '../shared'),
      },
    },
    build: {
      outDir: 'dist',
    },
    plugins: [react()],
  };
});
