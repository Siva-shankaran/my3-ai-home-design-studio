import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { handleAiProxyRequest } from './server/proxyHandler.ts';

function aiProxyPlugin(): Plugin {
  return {
    name: 'ai-proxy-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const handled = await handleAiProxyRequest(req, res);
          if (!handled) {
            next();
          }
        } catch (err) {
          next(err);
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), aiProxyPlugin()],
  server: {
    port: 5173,
    host: true,
  }
});
