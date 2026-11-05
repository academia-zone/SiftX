import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { VOICE_REGISTRY } from './voiceRegistry.js';

/**
 * Encodes 24kHz 16-bit mono PCM into standard 44-byte RIFF WAV.
 */
export function pcmToWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitDepth = 16) {
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([header, pcmBuffer]);
}

/**
 * Multi-Candidate Cross-Platform Edge-TTS Executor
 * Discovers the operational Python or Edge-TTS CLI runner without hardcoded paths or shell injection.
 */
async function executeEdgeTts(providerVoiceId, text, outputFile) {
  const candidates = [
    { bin: 'python', args: ['-m', 'edge_tts'] },
    { bin: 'python3', args: ['-m', 'edge_tts'] },
    { bin: 'py', args: ['-3', '-m', 'edge_tts'] },
    { bin: 'edge-tts.exe', args: [] },
    { bin: 'edge-tts', args: [] },
  ];

  let lastError = null;
  let executedSuccessfully = false;
  let executedBinary = null;

  // Retry loop (up to 2 attempts) to handle intermittent Microsoft Edge-TTS WebSocket drops
  for (let attempt = 0; attempt < 2 && !executedSuccessfully; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 600));
    }

    for (const c of candidates) {
      const fullArgs = [...c.args, '--voice', providerVoiceId, '--text', text, '--write-media', outputFile];
      try {
        await new Promise((resolve, reject) => {
          execFile(c.bin, fullArgs, { timeout: 20000, windowsHide: true }, (err, stdout, stderr) => {
            if (err) {
              return reject({ err, stderr: (stderr || '').toString().trim() });
            }
            resolve({ stdout, stderr });
          });
        });
        executedSuccessfully = true;
        executedBinary = c.bin;
        break;
      } catch (failure) {
        lastError = failure;
        const errCode = failure.err ? (failure.err.code || failure.err.errno) : null;
        // If executable was not found, continue trying the next candidate
        if (errCode === 'ENOENT' || errCode === 9009 || errCode === 127) {
          continue;
        }
        // If it's a process error (e.g. NoAudioReceived network drop), break candidate loop to allow retry
        break;
      }
    }
  }

  if (!executedSuccessfully) {
    const isTimeout = lastError?.err?.killed || lastError?.err?.signal === 'SIGTERM';
    const isNotFound = lastError?.err?.code === 'ENOENT' || lastError?.err?.code === 9009 || lastError?.err?.code === 127;
    
    const diagnostic = {
      code: isTimeout ? 'EDGE_TTS_TIMEOUT' : (isNotFound ? 'EDGE_TTS_EXECUTABLE_NOT_FOUND' : 'EDGE_TTS_PROCESS_FAILED'),
      message: isTimeout 
        ? 'Speech generation timed out after 20 seconds.' 
        : (isNotFound ? 'Neither Python with edge-tts nor edge-tts binary was found on the system.' : 'Edge-TTS subprocess exited with an error.'),
      systemError: lastError?.err?.message || 'Unknown execution failure',
      stderr: lastError?.stderr || null,
      attemptedBinary: executedBinary || candidates.map(c => c.bin).join(', ')
    };

    console.error('[SiftX Edge-TTS Error]', {
      voiceId: providerVoiceId,
      code: diagnostic.code,
      message: diagnostic.message,
      systemError: diagnostic.systemError,
      stderr: diagnostic.stderr
    });

    const errorObj = new Error(diagnostic.message);
    errorObj.code = diagnostic.code;
    throw errorObj;
  }

  // Validate output file
  if (!fs.existsSync(outputFile)) {
    console.error('[SiftX Edge-TTS Error]', {
      voiceId: providerVoiceId,
      code: 'EDGE_TTS_INVALID_AUDIO',
      message: 'Edge-TTS reported completion but output audio file was not created on disk.'
    });
    const errorObj = new Error('Generated speech audio file was not created.');
    errorObj.code = 'EDGE_TTS_INVALID_AUDIO';
    throw errorObj;
  }

  const stat = await fs.promises.stat(outputFile);
  if (stat.size < 100) {
    console.error('[SiftX Edge-TTS Error]', {
      voiceId: providerVoiceId,
      code: 'EDGE_TTS_INVALID_AUDIO',
      message: `Edge-TTS generated an empty or truncated audio file (${stat.size} bytes).`
    });
    const errorObj = new Error('Generated speech audio is empty or corrupted.');
    errorObj.code = 'EDGE_TTS_INVALID_AUDIO';
    throw errorObj;
  }

  const audioBytes = await fs.promises.readFile(outputFile);
  await fs.promises.unlink(outputFile).catch(() => {});
  return audioBytes;
}

/**
 * Handle TTS Request with STRICT Voice Mapping (NO SILENT FALLBACK).
 * If the selected voice fails, execution halts and returns a clean error.
 */
export async function handleTtsRequest(req, res, env) {
  try {
    const urlObj = new URL(req.url || '', 'http://localhost');
    const q = (urlObj.searchParams.get('q') || '').trim();
    const voiceKey = (urlObj.searchParams.get('voice') || 'uzma').toLowerCase();

    if (!q) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Missing text parameter q' }));
      return;
    }

    if (q.length > 2000) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Text exceeds maximum limit of 2000 characters' }));
      return;
    }

    // 1. Validate voice in strict registry
    const voiceMeta = VOICE_REGISTRY[voiceKey];
    if (!voiceMeta) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ 
        error: `Invalid voice '${voiceKey}'. Please select an active voice from the studio registry.`,
        code: 'INVALID_VOICE'
      }));
      return;
    }

    // 2. GEMINI LIVE TTS GENERATION (Aoede, Charon, Puck, Fenrir, Kore)
    if (voiceMeta.provider === 'gemini') {
      const geminiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          error: `Gemini API key is not configured for voice '${voiceMeta.name}'.`,
          provider: 'gemini',
          voice: voiceMeta.name,
          code: 'KEY_NOT_CONFIGURED'
        }));
        return;
      }

      const prompt = `Read the following text out loud verbatim. Do not add any introductory words or commentary:\n\n${q}`;
      const model = voiceMeta.model || 'gemini-3.1-flash-tts-preview';
      const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

      try {
        const geminiRes = await fetch(targetUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'User-Agent': 'SiftX-AudioStudio/1.0'
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceMeta.providerVoiceId,
                  },
                },
              },
            },
          }),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const part = data?.candidates?.[0]?.content?.parts?.[0];
          if (part?.inlineData?.data) {
            const pcmBytes = Buffer.from(part.inlineData.data, 'base64');
            const wavBytes = pcmToWav(pcmBytes, 24000, 1, 16);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('X-Audio-Provider', 'gemini');
            res.setHeader('X-Voice-Id', voiceMeta.id);
            res.setHeader('X-Voice-Name', voiceMeta.name);
            res.setHeader('X-Provider-Voice-Id', voiceMeta.providerVoiceId);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Expose-Headers', 'X-Audio-Provider, X-Voice-Id, X-Voice-Name, X-Provider-Voice-Id');
            res.end(wavBytes);
            return;
          }
        }

        // Handle specific Gemini HTTP error codes strictly
        if (geminiRes.status === 429) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: `Gemini quota limit reached for voice '${voiceMeta.name}'. Please wait a moment before retrying.`,
            provider: 'gemini',
            voice: voiceMeta.name,
            code: 'RATE_LIMIT_EXCEEDED'
          }));
          return;
        }

        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          error: `Gemini audio generation failed for voice '${voiceMeta.name}' (HTTP ${geminiRes.status}).`,
          provider: 'gemini',
          voice: voiceMeta.name,
          code: 'PROVIDER_ERROR'
        }));
        return;
      } catch {
        res.statusCode = 504;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          error: `Network timeout connecting to Gemini for voice '${voiceMeta.name}'.`,
          provider: 'gemini',
          voice: voiceMeta.name,
          code: 'NETWORK_TIMEOUT'
        }));
        return;
      }
    }

    // 3. FISH AUDIO GENERATION
    if (voiceMeta.provider === 'fish-audio') {
      const fishKey = env.FISH_AUDIO_API_KEY || process.env.FISH_AUDIO_API_KEY;
      if (!fishKey) {
        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          error: `Fish Audio API key is not configured for voice '${voiceMeta.name}'.`,
          provider: 'fish-audio',
          voice: voiceMeta.name,
          code: 'KEY_NOT_CONFIGURED'
        }));
        return;
      }

      try {
        const fishRes = await fetch('https://api.fish.audio/v1/tts', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${fishKey}`,
            'Content-Type': 'application/json',
            model: voiceMeta.model || 's2.1-pro-free',
            'User-Agent': 'SiftX-AudioStudio/1.0',
          },
          body: JSON.stringify({
            text: q,
            reference_id: voiceMeta.providerVoiceId,
            format: 'mp3',
          }),
        });

        if (fishRes.ok) {
          const arrayBuffer = await fishRes.arrayBuffer();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('X-Audio-Provider', 'fish-audio');
          res.setHeader('X-Voice-Id', voiceMeta.id);
          res.setHeader('X-Voice-Name', voiceMeta.name);
          res.setHeader('X-Provider-Voice-Id', voiceMeta.providerVoiceId);
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Expose-Headers', 'X-Audio-Provider, X-Voice-Id, X-Voice-Name, X-Provider-Voice-Id');
          res.end(Buffer.from(arrayBuffer));
          return;
        }

        if (fishRes.status === 402) {
          res.statusCode = 402;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            error: `Fish Audio account credit required for voice '${voiceMeta.name}'.`,
            provider: 'fish-audio',
            voice: voiceMeta.name,
            code: 'INSUFFICIENT_CREDIT'
          }));
          return;
        }

        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          error: `Fish Audio synthesis failed for voice '${voiceMeta.name}' (HTTP ${fishRes.status}).`,
          provider: 'fish-audio',
          voice: voiceMeta.name,
          code: 'PROVIDER_ERROR'
        }));
        return;
      } catch {
        res.statusCode = 504;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          error: `Network timeout connecting to Fish Audio for voice '${voiceMeta.name}'.`,
          provider: 'fish-audio',
          voice: voiceMeta.name,
          code: 'NETWORK_TIMEOUT'
        }));
        return;
      }
    }

    // 4. PAKISTANI NATIVE URDU VOICES (Edge-TTS)
    if (voiceMeta.provider === 'edge-tts') {
      const tmpFile = path.join(os.tmpdir(), `siftx_tts_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);

      try {
        const audioBytes = await executeEdgeTts(voiceMeta.providerVoiceId, q, tmpFile);
        
        res.statusCode = 200;
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('X-Audio-Provider', 'edge-tts');
        res.setHeader('X-Voice-Id', voiceMeta.id);
        res.setHeader('X-Voice-Name', encodeURIComponent(voiceMeta.name));
        res.setHeader('X-Provider-Voice-Id', voiceMeta.providerVoiceId);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'X-Audio-Provider, X-Voice-Id, X-Voice-Name, X-Provider-Voice-Id');
        res.end(audioBytes);
        return;
      } catch (err) {
        // Clean up temp file on failure if present
        if (fs.existsSync(tmpFile)) {
          await fs.promises.unlink(tmpFile).catch(() => {});
        }

        const errorCode = err.code || 'EDGE_TTS_UNAVAILABLE';
        let userMessage = `Local speech engine failed to render voice '${voiceMeta.name}'.`;
        if (errorCode === 'EDGE_TTS_TIMEOUT') {
          userMessage = `Voice generation timed out for '${voiceMeta.name}'. Please try a shorter sentence.`;
        } else if (errorCode === 'EDGE_TTS_EXECUTABLE_NOT_FOUND') {
          userMessage = `Speech engine executable for '${voiceMeta.name}' could not be located on the server.`;
        } else if (errorCode === 'EDGE_TTS_INVALID_AUDIO') {
          userMessage = `Speech engine returned invalid or empty audio for '${voiceMeta.name}'.`;
        }

        res.statusCode = 503;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          error: userMessage,
          provider: 'edge-tts',
          voice: voiceMeta.name,
          code: errorCode
        }));
        return;
      }
    }

    // If an unregistered provider is specified
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: `Unsupported voice provider for '${voiceKey}'.` }));
  } catch {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal server error processing audio request.' }));
  }
}

/**
 * Handle STT Request via Groq Cloud Whisper
 */
export async function handleSttRequest(req, res, env) {
  try {
    const groqKey = env.GROQ_API_KEY || process.env.GROQ_API_KEY;
    if (!groqKey) {
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Cloud speech-to-text service is not configured.' }));
      return;
    }

    const chunks = [];
    let totalLength = 0;
    const maxSizeBytes = 25 * 1024 * 1024; // 25MB

    req.on('data', (chunk) => {
      totalLength += chunk.length;
      if (totalLength > maxSizeBytes) {
        req.destroy();
        res.statusCode = 413;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Audio file exceeds the maximum 25MB limit.' }));
      } else {
        chunks.push(chunk);
      }
    });

    req.on('end', async () => {
      if (res.writableEnded) return;

      const audioBuffer = Buffer.concat(chunks);
      if (audioBuffer.length === 0) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Uploaded audio data is empty.' }));
        return;
      }

      const clientContentType = req.headers['content-type'] || 'audio/wav';
      const clientFilename = req.headers['x-filename'] 
        ? decodeURIComponent(req.headers['x-filename']) 
        : 'audio.wav';
      const clientLang = req.headers['x-lang'] || 'en';

      const boundary = '----WebKitFormBoundary' + Date.now().toString(16) + Math.random().toString(16);
      const crlf = Buffer.from('\r\n');
      const parts = [];

      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${clientFilename}"\r\nContent-Type: ${clientContentType}\r\n\r\n`));
      parts.push(audioBuffer);
      parts.push(crlf);

      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3-turbo\r\n`));
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\nverbose_json\r\n`));

      if (clientLang && clientLang !== 'auto') {
        const langCode = clientLang.split('-')[0];
        parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="language"\r\n\r\n${langCode}\r\n`));
      }

      parts.push(Buffer.from(`--${boundary}--\r\n`));
      const multipartBody = Buffer.concat(parts);

      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'User-Agent': 'SiftX-AudioStudio/1.0',
          },
          body: multipartBody,
        });

        if (groqRes.ok) {
          const result = await groqRes.json();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify({
            transcript: result.text || '',
            duration: result.duration || 0,
            language: result.language || clientLang,
            segments: Array.isArray(result.segments) ? result.segments : [],
            words: Array.isArray(result.words) ? result.words : [],
            model: 'whisper-large-v3-turbo',
          }));
          return;
        }

        if (groqRes.status === 429) {
          res.statusCode = 429;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Transcription rate limit exceeded. Please wait a moment and try again.' }));
          return;
        }

        const errText = await groqRes.text().catch(() => '');
        console.error('[Groq STT Error]', groqRes.status, errText);
        res.statusCode = groqRes.status >= 500 ? 502 : 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Audio transcription error (${groqRes.status}): ${errText || 'Invalid format'}` }));
      } catch (networkErr) {
        console.error('[STT Network Error]', networkErr);
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: `Could not connect to transcription provider: ${networkErr.message || 'Network failure'}` }));
      }
    });

    req.on('error', () => {
      if (!res.writableEnded) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Audio upload stream interrupted.' }));
      }
    });
  } catch {
    if (!res.writableEnded) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal speech-to-text error.' }));
    }
  }
}
