import { handleTtsRequest } from '../server/audioService.js';

/**
 * SiftX Text-to-Speech Serverless Endpoint
 * Path: /api/tts?q=...&voice=...&tl=...
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Voice-Key, X-Language');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Pass request to authoritative audioService with environment variables
  await handleTtsRequest(req, res, process.env);
}
