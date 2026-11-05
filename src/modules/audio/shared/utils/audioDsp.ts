/**
 * Real Web Audio API DSP Engine for voice transformations.
 * Uses OfflineAudioContext to render actual transformed audio buffers.
 */
export async function applyVoiceEffect(
  sourceBuffer: AudioBuffer,
  effectId: 'clean' | 'documentary' | 'robot' | 'chipmunk' | 'deep' | 'radio' | 'echo',
  intensity = 1.0
): Promise<AudioBuffer> {
  const sampleRate = sourceBuffer.sampleRate;
  const numChannels = sourceBuffer.numberOfChannels;

  // 1. CHIPMUNK (High Pitch) - Resample pitch shift
  if (effectId === 'chipmunk') {
    const rate = 1.0 + (0.38 * intensity); // 1.38x
    const newLength = Math.floor(sourceBuffer.length / rate);
    const offlineCtx = new OfflineAudioContext(numChannels, newLength, sampleRate);
    
    const source = offlineCtx.createBufferSource();
    source.buffer = sourceBuffer;
    source.playbackRate.value = rate;
    source.connect(offlineCtx.destination);
    source.start(0);

    return await offlineCtx.startRendering();
  }

  // 2. DEEP MOVIE TRAILER - Resample pitch shift + low shelf bass boost
  if (effectId === 'deep') {
    const rate = 1.0 - (0.24 * intensity); // 0.76x
    const newLength = Math.floor(sourceBuffer.length / rate);
    const offlineCtx = new OfflineAudioContext(numChannels, newLength, sampleRate);
    
    const source = offlineCtx.createBufferSource();
    source.buffer = sourceBuffer;
    source.playbackRate.value = rate;

    // Resonant low shelf to give deep chest resonance
    const bass = offlineCtx.createBiquadFilter();
    bass.type = 'lowshelf';
    bass.frequency.value = 220;
    bass.gain.value = 6 * intensity;

    source.connect(bass);
    bass.connect(offlineCtx.destination);
    source.start(0);

    return await offlineCtx.startRendering();
  }

  // Common Offline Context for same-length audio effects
  const offlineCtx = new OfflineAudioContext(numChannels, sourceBuffer.length, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = sourceBuffer;

  // 3. DOCUMENTARY NARRATOR (BBC / National Geographic Studio Broadcast Master)
  if (effectId === 'documentary') {
    // Warm low-shelf proximity boost (140Hz) for intimate chest resonance
    const warmBass = offlineCtx.createBiquadFilter();
    warmBass.type = 'lowshelf';
    warmBass.frequency.value = 140;
    warmBass.gain.value = 4.5 * intensity;

    // Anti-boxiness notch (480Hz) to cut cheap hollow room reflections
    const antiBoxiness = offlineCtx.createBiquadFilter();
    antiBoxiness.type = 'peaking';
    antiBoxiness.frequency.value = 480;
    antiBoxiness.Q.value = 1.2;
    antiBoxiness.gain.value = -3.5 * intensity;

    // Crisp vocal presence (3.8kHz) for crystal-clear diction & consonant bite
    const vocalAir = offlineCtx.createBiquadFilter();
    vocalAir.type = 'peaking';
    vocalAir.frequency.value = 3800;
    vocalAir.Q.value = 0.9;
    vocalAir.gain.value = 3.2 * intensity;

    // Studio broadcast compressor to even out cadence and create authoritative rhythm
    const broadcastComp = offlineCtx.createDynamicsCompressor();
    broadcastComp.threshold.value = -24;
    broadcastComp.knee.value = 6;
    broadcastComp.ratio.value = 3.8;
    broadcastComp.attack.value = 0.005;
    broadcastComp.release.value = 0.15;

    source.connect(warmBass);
    warmBass.connect(antiBoxiness);
    antiBoxiness.connect(vocalAir);
    vocalAir.connect(broadcastComp);
    broadcastComp.connect(offlineCtx.destination);

    source.start(0);
    return await offlineCtx.startRendering();
  }

  // 4. CYBER ROBOT - Ring Modulation (50Hz carrier multiplier)
  if (effectId === 'robot') {
    const carrier = offlineCtx.createOscillator();
    carrier.type = 'sawtooth';
    carrier.frequency.value = 50 * intensity; // 50 Hz carrier

    const ringModGain = offlineCtx.createGain();
    ringModGain.gain.value = 0; // modulated by carrier

    // Connect carrier to gain audio-rate parameter
    carrier.connect(ringModGain.gain);
    source.connect(ringModGain);

    // Mix dry and wet
    const dryGain = offlineCtx.createGain();
    dryGain.gain.value = 0.25;
    source.connect(dryGain);

    const master = offlineCtx.createGain();
    master.gain.value = 1.2;

    ringModGain.connect(master);
    dryGain.connect(master);
    master.connect(offlineCtx.destination);

    carrier.start(0);
    source.start(0);

    return await offlineCtx.startRendering();
  }

  // 5. VINTAGE WALKIE-TALKIE / AM RADIO
  if (effectId === 'radio') {
    // Highpass at 450Hz
    const highpass = offlineCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 450;

    // Lowpass at 2800Hz
    const lowpass = offlineCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2800;

    // Subtle distortion wave shaper for AM radio grit
    const distortion = offlineCtx.createWaveShaper();
    distortion.curve = makeDistortionCurve(20 * intensity);
    distortion.oversample = '2x';

    source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(distortion);
    distortion.connect(offlineCtx.destination);

    source.start(0);
    return await offlineCtx.startRendering();
  }

  // 6. COSMIC ECHO (Delay + Feedback Loop)
  if (effectId === 'echo') {
    const delay = offlineCtx.createDelay(1.0);
    delay.delayTime.value = 0.32; // 320ms echo

    const feedback = offlineCtx.createGain();
    feedback.gain.value = 0.42 * intensity;

    const dampingFilter = offlineCtx.createBiquadFilter();
    dampingFilter.type = 'lowpass';
    dampingFilter.frequency.value = 2400; // Damped high frequencies in echoes

    // Feedback loop: delay -> damping -> feedback -> delay
    source.connect(delay);
    delay.connect(dampingFilter);
    dampingFilter.connect(feedback);
    feedback.connect(delay);

    // Mix dry & wet to destination
    const dry = offlineCtx.createGain();
    dry.gain.value = 1.0;
    source.connect(dry);

    dry.connect(offlineCtx.destination);
    delay.connect(offlineCtx.destination);

    source.start(0);
    return await offlineCtx.startRendering();
  }

  // 7. STUDIO CLEAN (Peak Normalization & DC offset filter)
  const dcFilter = offlineCtx.createBiquadFilter();
  dcFilter.type = 'highpass';
  dcFilter.frequency.value = 20;

  source.connect(dcFilter);
  dcFilter.connect(offlineCtx.destination);
  source.start(0);

  return await offlineCtx.startRendering();
}

/**
 * Creates an S-curve distortion transfer function for radio saturation.
 */
function makeDistortionCurve(amount: number) {
  const k = amount;
  const nSamples = 44100;
  const curve = new Float32Array(nSamples);
  const deg = Math.PI / 180;
  for (let i = 0; i < nSamples; ++i) {
    const x = (i * 2) / nSamples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

/**
 * Decodes an uploaded Audio File (Blob/File) into an AudioBuffer.
 */
export async function decodeAudioFile(file: File | Blob): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  try {
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    return decoded;
  } finally {
    if (audioCtx.state !== 'closed') {
      audioCtx.close();
    }
  }
}
