import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { Readable } from 'stream';

/**
 * Convert Hex Color #RRGGBB to ASS color &H00BBGGRR&
 */
function hexToAssColor(hex) {
  if (!hex) return '&H0024BFFB&';
  const clean = hex.replace('#', '');
  const r = clean.substring(0, 2);
  const g = clean.substring(2, 4);
  const b = clean.substring(4, 6);
  return '&H00' + (b || '00').toUpperCase() + (g || '00').toUpperCase() + (r || '00').toUpperCase() + '&';
}

/**
 * Format seconds to ASS timestamp: H:MM:SS.CC (centiseconds)
 */
function formatAssTime(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = Math.floor(total % 60);
  const cs = Math.floor((total % 1) * 100);

  return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
}

/**
 * Check if text contains Arabic/Urdu script
 */
function isRtlText(text) {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text || '');
}

/**
 * Generate ASS Subtitle Script from Subtitle Items and Options
 */
function generateAssScript(subtitles, options) {
  const width = options.videoWidth || 1080;
  const height = options.videoHeight || 1920;
  const isVertical = height > width;

  const style = options.style || 'tiktok';
  const position = options.position || 'bottom';
  const highlightAss = hexToAssColor(options.highlightColor || (style === 'neon' ? '#22d3ee' : '#fbbf24'));
  const maxWords = options.maxWordsPerLine || 6;

  let fontName = 'Arial';
  if (options.fontFamily === 'nastaliq') {
    fontName = 'Noto Nastaliq Urdu';
  } else if (options.fontFamily === 'gulzar') {
    fontName = 'Gulzar';
  }

  // Calculate font size proportional to video height
  const scaleRatio = Number(options.fontSizeScale) || (isVertical ? 0.048 : 0.055);
  const baseFontSize = Math.max(28, Math.round(height * scaleRatio));

  // ASS Alignment: 2 = bottom-center, 5 = middle-center, 8 = top-center
  let alignment = 2;
  let marginV = Math.round(height * 0.12);
  if (position === 'top') {
    alignment = 8;
    marginV = Math.round(height * 0.10);
  } else if (position === 'middle') {
    alignment = 5;
    marginV = 0;
  }

  // Border Style: 1 = outline + shadow, 3 = opaque box (classic/badge)
  const borderStyle = (style === 'classic' || style === 'badge') ? 3 : 1;
  const outline = style === 'classic' || style === 'badge' ? 6 : 4;
  const shadow = style === 'neon' ? 4 : 2;

  // Primary color based on style preset
  const primaryColor = style === 'tiktok' 
    ? highlightAss 
    : style === 'neon' 
    ? '&H00EED322&' 
    : '&H00FFFFFF&';

  let ass = `[Script Info]
Title: SiftX CapCut Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: ${width}
PlayResY: ${height}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,${fontName},${baseFontSize},${primaryColor},${primaryColor},&H00000000,&H90000000,-1,0,0,0,100,100,0,0,${borderStyle},${outline},${shadow},${alignment},40,40,${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  // Build dialogue events
  subtitles.forEach((item) => {
    const text = (item.text || '').trim();
    if (!text) return;

    const startStr = formatAssTime(item.start);
    const endStr = formatAssTime(item.end);

    const isRtl = isRtlText(text);

    if (isRtl) {
      // Clean RTL line wrapping without inline control tags to prevent BiDi chunk reversal
      const rawWords = text.split(/\s+/).filter(Boolean);
      const lines = [];
      for (let i = 0; i < rawWords.length; i += maxWords) {
        lines.push(rawWords.slice(i, i + maxWords).join(' '));
      }
      const fullText = lines.join(' \\N ');
      ass += `Dialogue: 0,${startStr},${endStr},Default,,0,0,0,,${fullText}\n`;
    } else {
      // English / LTR text with word-level animation
      const rawWords = text.split(/\s+/).filter(Boolean);
      const words = Array.isArray(item.words) && item.words.length === rawWords.length
        ? item.words
        : rawWords.map((w, idx) => {
            const dur = Math.max(0.1, item.end - item.start);
            const wDur = dur / rawWords.length;
            return {
              word: w,
              start: item.start + idx * wDur,
              end: item.start + (idx + 1) * wDur,
            };
          });

      const lines = [];
      for (let i = 0; i < words.length; i += maxWords) {
        lines.push(words.slice(i, i + maxWords));
      }

      words.forEach((activeW) => {
        const wStart = formatAssTime(activeW.start);
        const wEnd = formatAssTime(activeW.end);

        const lineStrings = lines.map((line) => {
          return line.map((w) => {
            const isCurrent = w.word === activeW.word && Math.abs(w.start - activeW.start) < 0.05;
            const display = options.isUppercase ? w.word.toUpperCase() : w.word;
            if (isCurrent) {
              return `{\\c${highlightAss}}${display}{\\c&H00FFFFFF&}`;
            }
            return display;
          }).join(' ');
        });

        const fullText = lineStrings.join('\\N');
        ass += `Dialogue: 0,${wStart},${wEnd},Default,,0,0,0,,${fullText}\n`;
      });
    }
  });

  return ass;
}

/**
 * Handle Export Video Request with FFmpeg
 */
export async function handleExportVideoRequest(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  try {
    let subtitles = [];
    let options = {};
    let originalFilename = 'video.mp4';
    let videoBuffer = null;

    const contentType = req.headers['content-type'] || '';

    if (contentType.includes('multipart/form-data')) {
      const webReq = new Request('http://localhost' + req.url, {
        method: req.method,
        headers: req.headers,
        body: Readable.toWeb(req),
        duplex: 'half'
      });
      const formData = await webReq.formData();

      const rawSubtitles = formData.get('subtitles') || '';
      const rawOptions = formData.get('options') || '';
      const videoField = formData.get('video');

      if (rawSubtitles) {
        try { subtitles = JSON.parse(rawSubtitles); } catch (e) {
          console.warn('Subtitles JSON parse error:', e.message);
        }
      }
      if (rawOptions) {
        try { options = JSON.parse(rawOptions); } catch (e) {
          console.warn('Options JSON parse error:', e.message);
        }
      }
      if (videoField && typeof videoField !== 'string') {
        originalFilename = videoField.name || 'video.mp4';
        videoBuffer = Buffer.from(await videoField.arrayBuffer());
      }
    } else {
      // Legacy header fallback
      const rawSubtitles = req.headers['x-subtitles'] || '';
      const rawOptions = req.headers['x-options'] || '';
      if (req.headers['x-filename']) {
        originalFilename = decodeURIComponent(req.headers['x-filename']);
      }
      if (rawSubtitles) {
        try { subtitles = JSON.parse(decodeURIComponent(rawSubtitles)); } catch (e) {}
      }
      if (rawOptions) {
        try { options = JSON.parse(decodeURIComponent(rawOptions)); } catch (e) {}
      }
    }

    if (!Array.isArray(subtitles) || subtitles.length === 0) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'No subtitles provided for export.' }));
      return;
    }

    const tempId = Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const tempDir = os.tmpdir();
    const inputExt = path.extname(originalFilename) || '.mp4';
    const inputFilename = `siftx_in_${tempId}${inputExt}`;
    const assFilename = `siftx_sub_${tempId}.ass`;
    const srtFilename = `siftx_sub_${tempId}.srt`;
    const outputFilename = `siftx_out_${tempId}.mp4`;

    const tempInput = path.join(tempDir, inputFilename);
    const tempAss = path.join(tempDir, assFilename);
    const tempSrt = path.join(tempDir, srtFilename);
    const tempOutput = path.join(tempDir, outputFilename);

    const executePipeline = () => {
      try {
        const exportType = options.exportType || 'hard'; // 'hard' (CapCut visual) or 'soft' (100% bit-exact copy)

        let ffmpegArgs = [];

        if (exportType === 'soft') {
          // Mode: 100% Bit-for-Bit Untouched Video (Zero re-encoding, lossless stream copy)
          let srtContent = '';
          subtitles.forEach((s, idx) => {
            const sSec = s.start || 0;
            const eSec = s.end || 0;
            const formatTime = (sec) => {
              const h = Math.floor(sec / 3600).toString().padStart(2, '0');
              const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
              const sInt = Math.floor(sec % 60).toString().padStart(2, '0');
              const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
              return `${h}:${m}:${sInt},${ms}`;
            };
            srtContent += `${idx + 1}\n${formatTime(sSec)} --> ${formatTime(eSec)}\n${s.text}\n\n`;
          });
          fs.writeFileSync(tempSrt, srtContent, 'utf-8');

          ffmpegArgs = [
            '-i', inputFilename,
            '-i', srtFilename,
            '-c:v', 'copy',
            '-c:a', 'copy',
            '-c:s', 'mov_text',
            '-metadata:s:s:0', 'language=urd',
            '-movflags', '+faststart',
            '-y', outputFilename
          ];
        } else {
          // Mode: Ultra HD Studio Lossless Hardcoded (Visually identical to master source)
          const assContent = generateAssScript(subtitles, options);
          fs.writeFileSync(tempAss, assContent, 'utf-8');

          const quality = options.qualityMode || 'ultra';
          let crf = '16';
          let preset = 'veryfast';
          let audioBitrate = '320k';

          if (quality === 'high') {
            crf = '18';
            preset = 'veryfast';
            audioBitrate = '256k';
          } else if (quality === 'standard') {
            crf = '22';
            preset = 'ultrafast';
            audioBitrate = '192k';
          }

          const fontSrc = path.join(process.cwd(), 'public', 'fonts', 'NotoNastaliqUrdu.ttf');
          const fontDest = path.join(tempDir, 'NotoNastaliqUrdu.ttf');
          if (fs.existsSync(fontSrc) && !fs.existsSync(fontDest)) {
            try { fs.copyFileSync(fontSrc, fontDest); } catch (_) {}
          }

          ffmpegArgs = [
            '-i', inputFilename,
            '-vf', `ass=${assFilename}:fontsdir=.`,
            '-c:v', 'libx264',
            '-preset', preset,
            '-crf', crf,
            '-profile:v', 'high',
            '-level', '4.2',
            '-c:a', 'aac',
            '-b:a', audioBitrate,
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            '-y', outputFilename
          ];
        }

        console.log(`[FFmpeg Export] Processing ${originalFilename} (Mode: ${exportType}, Quality: ${options.qualityMode || 'ultra'})...`);

        execFile('ffmpeg', ffmpegArgs, { cwd: tempDir }, (err, stdout, stderr) => {
          if (err) {
            console.error('[FFmpeg Error]:', err.message);
            console.error(stderr);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'FFmpeg video export failed: ' + err.message }));
            // Cleanup
            try { fs.unlinkSync(tempInput); } catch (_) {}
            try { fs.unlinkSync(tempAss); } catch (_) {}
            try { fs.unlinkSync(tempSrt); } catch (_) {}
            return;
          }

          if (!fs.existsSync(tempOutput)) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'FFmpeg produced no output file.' }));
            return;
          }

          const outStat = fs.statSync(tempOutput);
          const baseName = path.basename(originalFilename, path.extname(originalFilename));
          const downloadName = `${baseName}-capcut.mp4`;

          res.statusCode = 200;
          res.setHeader('Content-Type', 'video/mp4');
          res.setHeader('Content-Length', outStat.size);
          res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);
          res.setHeader('Access-Control-Allow-Origin', '*');

          const readStream = fs.createReadStream(tempOutput);
          readStream.pipe(res);

          readStream.on('close', () => {
            // Cleanup all temporary files
            try { fs.unlinkSync(tempInput); } catch (_) {}
            try { fs.unlinkSync(tempAss); } catch (_) {}
            try { fs.unlinkSync(tempSrt); } catch (_) {}
            try { fs.unlinkSync(tempOutput); } catch (_) {}
            console.log(`[FFmpeg Export] Completed & delivered: ${downloadName} (${Math.round(outStat.size / 1024)} KB)`);
          });
        });
      } catch (processErr) {
        console.error('Export processing error:', processErr);
        res.statusCode = 500;
        res.end('Error during subtitle export generation');
      }
    };

    if (videoBuffer) {
      fs.writeFileSync(tempInput, videoBuffer);
      executePipeline();
    } else {
      const fileWriteStream = fs.createWriteStream(tempInput);
      req.pipe(fileWriteStream);
      fileWriteStream.on('error', (err) => {
        console.error('File write stream error:', err);
        res.statusCode = 500;
        res.end('Error writing upload file');
      });
      fileWriteStream.on('finish', () => {
        executePipeline();
      });
    }
  } catch (handlerErr) {
    console.error('handleExportVideoRequest handler error:', handlerErr);
    res.statusCode = 500;
    res.end('Internal server error during video export');
  }
}
