import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleTtsRequest, handleSttRequest } from './audioService.js';
import { handleExportVideoRequest } from './videoService.js';
import { handleAuditWebsiteRequest } from './websiteAuditService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

// Safe local .env loader (without external dotenv dependency)
const env = { ...process.env };
const envPath = path.resolve(rootDir, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envLines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of envLines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...vParts] = trimmed.split('=');
        const v = vParts.join('=').trim();
        if (k && !env[k.trim()]) {
          env[k.trim()] = v;
        }
      }
    }
  } catch (err) {
    console.warn('Could not read .env file:', err.message);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlObj = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;

  // 1. API ROUTES
  if (pathname === '/api/tts') {
    handleTtsRequest(req, res, env);
    return;
  }

  if (pathname === '/api/stt') {
    handleSttRequest(req, res, env);
    return;
  }

  if (pathname === '/api/export-video') {
    handleExportVideoRequest(req, res);
    return;
  }

  if (pathname === '/api/audit-website') {
    handleAuditWebsiteRequest(req, res);
    return;
  }

  // 2. STATIC ASSETS SERVING FROM dist/
  let filePath = path.join(distDir, pathname);

  // Check if file exists in dist
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    if (pathname.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // 3. SPA FALLBACK (Serve dist/index.html for frontend routes like /audio, /tool-studio)
  const indexHtmlPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    fs.createReadStream(indexHtmlPath).pipe(res);
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Not Found. Build the project with npm run build first.');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[SiftX Production Server] Online at http://localhost:${PORT}`);
  console.log(`[Audio Studio] Endpoints active: /api/tts, /api/stt`);
});
