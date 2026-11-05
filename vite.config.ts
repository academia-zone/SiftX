import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleTtsRequest, handleSttRequest } from './server/audioService.js';
import { handleExportVideoRequest } from './server/videoService.js';
import { handleAuditWebsiteRequest } from './server/websiteAuditService.js';

function audioProxyPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'audio-proxy-middleware',
    configureServer(server) {
      server.middlewares.use('/api/tts', (req, res) => {
        handleTtsRequest(req, res, env);
      });
      server.middlewares.use('/api/stt', (req, res) => {
        handleSttRequest(req, res, env);
      });
      server.middlewares.use('/api/export-video', (req, res) => {
        handleExportVideoRequest(req, res);
      });
      server.middlewares.use('/api/audit-website', (req, res) => {
        handleAuditWebsiteRequest(req, res);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      audioProxyPlugin(env),
    ],
  };
});
