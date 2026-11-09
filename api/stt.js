import { handleSttRequest } from '../server/audioService.js';

export const config = {
  api: {
    bodyParser: false, // Allow raw binary audio streaming
    responseLimit: '25mb'
  }
};

/**
 * SiftX Speech-to-Text Serverless Endpoint
 * Path: /api/stt
 */
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Filename, X-Lang');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
    return;
  }

  await handleSttRequest(req, res, process.env);
}
