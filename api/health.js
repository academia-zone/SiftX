/**
 * SiftX System Health & API Readiness Endpoint
 * Path: /api/health
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const groqConfigured = Boolean(process.env.GROQ_API_KEY);
  const fishConfigured = Boolean(process.env.FISH_AUDIO_API_KEY);

  res.statusCode = 200;
  res.end(JSON.stringify({
    success: true,
    platform: 'SiftX Universal Toolkit',
    runtime: 'Vercel Serverless Function',
    status: 'operational',
    timestamp: new Date().toISOString(),
    providers: {
      geminiTts: geminiConfigured ? 'ready' : 'missing_key',
      groqWhisperStt: groqConfigured ? 'ready' : 'missing_key',
      fishAudio: fishConfigured ? 'ready' : 'missing_key'
    }
  }));
}
