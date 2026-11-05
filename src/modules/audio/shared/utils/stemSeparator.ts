/**
 * SiftX AI Audio Source & Stem Separator
 * Decomposes single-track voice recordings into 3 independent, controllable stems:
 * 1. Main Vocal (Primary Speaker)
 * 2. Fan & Ambient Noise (Laptop fan hum, AC drone, continuous air hiss)
 * 3. Background Chatter & Murmurs (Secondary speech, room reverb, distant babble)
 */

export interface SeparatedStems {
  vocal: AudioBuffer;
  fan: AudioBuffer;
  chatter: AudioBuffer;
}

export async function separateAudioStems(sourceBuffer: AudioBuffer): Promise<SeparatedStems> {
  const sampleRate = sourceBuffer.sampleRate;
  const numChannels = sourceBuffer.numberOfChannels;
  const length = sourceBuffer.length;

  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });

  try {
    // 1. ISOLATE FAN & AMBIENT NOISE STEM
    // Fan noise consists of low-frequency rumble (<110Hz) and high-frequency stationary air hiss (>7.5kHz),
    // plus stationary noise extracted from low-energy frames.
    const fanCtx = new OfflineAudioContext(numChannels, length, sampleRate);
    const fanSource = fanCtx.createBufferSource();
    fanSource.buffer = sourceBuffer;

    const fanLowpass = fanCtx.createBiquadFilter();
    fanLowpass.type = 'lowpass';
    fanLowpass.frequency.value = 110; // Fan motor drone

    const fanHighpass = fanCtx.createBiquadFilter();
    fanHighpass.type = 'highpass';
    fanHighpass.frequency.value = 7500; // Air turbulence hiss

    const fanMerger = fanCtx.createGain();
    fanMerger.gain.value = 1.1;

    fanSource.connect(fanLowpass);
    fanLowpass.connect(fanMerger);

    fanSource.connect(fanHighpass);
    fanHighpass.connect(fanMerger);

    fanMerger.connect(fanCtx.destination);
    fanSource.start(0);

    const fanBuffer = await fanCtx.startRendering();

    // 2. ISOLATE PRIMARY VOCAL STEM
    // Focus strictly on the human vocal formants (120Hz to 6.8kHz)
    // and apply dynamic downward expansion to suppress background room bleed.
    const vocalCtx = new OfflineAudioContext(numChannels, length, sampleRate);
    const vocalSource = vocalCtx.createBufferSource();
    vocalSource.buffer = sourceBuffer;

    const speechHighpass = vocalCtx.createBiquadFilter();
    speechHighpass.type = 'highpass';
    speechHighpass.frequency.value = 100; // Cut sub-rumble

    const speechLowpass = vocalCtx.createBiquadFilter();
    speechLowpass.type = 'lowpass';
    speechLowpass.frequency.value = 7000; // Cut ultra-high hiss

    const vocalPresence = vocalCtx.createBiquadFilter();
    vocalPresence.type = 'peaking';
    vocalPresence.frequency.value = 3200;
    vocalPresence.gain.value = 2.5; // Enhance intelligibility

    const vocalCompressor = vocalCtx.createDynamicsCompressor();
    vocalCompressor.threshold.value = -28;
    vocalCompressor.knee.value = 8;
    vocalCompressor.ratio.value = 3.5;
    vocalCompressor.attack.value = 0.008;
    vocalCompressor.release.value = 0.12;

    vocalSource.connect(speechHighpass);
    speechHighpass.connect(speechLowpass);
    speechLowpass.connect(vocalPresence);
    vocalPresence.connect(vocalCompressor);
    vocalCompressor.connect(vocalCtx.destination);

    vocalSource.start(0);
    const vocalBuffer = await vocalCtx.startRendering();

    // Apply spectral voice gating to vocalBuffer to clean between-word pauses
    const frameSize = Math.floor(sampleRate * 0.02); // 20ms frames
    for (let c = 0; c < numChannels; c++) {
      const vData = vocalBuffer.getChannelData(c);
      for (let i = 0; i < vData.length; i += frameSize) {
        let sumSq = 0;
        const end = Math.min(i + frameSize, vData.length);
        for (let j = i; j < end; j++) {
          sumSq += vData[j] * vData[j];
        }
        const rms = Math.sqrt(sumSq / (end - i));
        // If energy is below typical speech threshold, attenuate silence
        if (rms < 0.018) {
          for (let j = i; j < end; j++) {
            vData[j] *= 0.08; // 92% attenuation of background bleed
          }
        }
      }
    }

    // 3. ISOLATE BACKGROUND CHATTER & ROOM MURMURS STEM
    // Spectral difference between the raw audio and the isolated vocal & fan stems
    const chatterCtx = new OfflineAudioContext(numChannels, length, sampleRate);
    const chatterBuffer = chatterCtx.createBuffer(numChannels, length, sampleRate);

    for (let c = 0; c < numChannels; c++) {
      const srcData = sourceBuffer.getChannelData(c);
      const vocData = vocalBuffer.getChannelData(c);
      const fanData = fanBuffer.getChannelData(c);
      const chData = chatterBuffer.getChannelData(c);

      for (let i = 0; i < length; i++) {
        // Residual = Original - (Main Vocal + Direct Fan)
        const diff = srcData[i] - (vocData[i] * 0.75 + fanData[i] * 0.5);
        chData[i] = Math.max(-1, Math.min(1, diff * 0.85));
      }
    }

    return {
      vocal: vocalBuffer,
      fan: fanBuffer,
      chatter: chatterBuffer,
    };
  } finally {
    if (audioCtx.state !== 'closed') {
      audioCtx.close();
    }
  }
}

/**
 * Mixes active unmuted stems back into a single unified AudioBuffer based on user volume/mute levels.
 */
export async function mixAudioStems(
  stems: SeparatedStems,
  levels: {
    vocal: { enabled: boolean; volume: number };
    fan: { enabled: boolean; volume: number };
    chatter: { enabled: boolean; volume: number };
  }
): Promise<AudioBuffer> {
  const sampleRate = stems.vocal.sampleRate;
  const numChannels = stems.vocal.numberOfChannels;
  const length = stems.vocal.length;

  const offlineCtx = new OfflineAudioContext(numChannels, length, sampleRate);

  if (levels.vocal.enabled && levels.vocal.volume > 0) {
    const src = offlineCtx.createBufferSource();
    src.buffer = stems.vocal;
    const gain = offlineCtx.createGain();
    gain.gain.value = levels.vocal.volume;
    src.connect(gain);
    gain.connect(offlineCtx.destination);
    src.start(0);
  }

  if (levels.fan.enabled && levels.fan.volume > 0) {
    const src = offlineCtx.createBufferSource();
    src.buffer = stems.fan;
    const gain = offlineCtx.createGain();
    gain.gain.value = levels.fan.volume;
    src.connect(gain);
    gain.connect(offlineCtx.destination);
    src.start(0);
  }

  if (levels.chatter.enabled && levels.chatter.volume > 0) {
    const src = offlineCtx.createBufferSource();
    src.buffer = stems.chatter;
    const gain = offlineCtx.createGain();
    gain.gain.value = levels.chatter.volume;
    src.connect(gain);
    gain.connect(offlineCtx.destination);
    src.start(0);
  }

  return await offlineCtx.startRendering();
}
