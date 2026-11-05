/**
 * Real client-side Noise Suppression and Room Rumble Filter.
 * Applies a combination of highpass rumble filtering (85Hz),
 * high-frequency hiss attenuation, and adaptive noise floor gating.
 */
export async function reduceBackgroundNoise(
  sourceBuffer: AudioBuffer,
  strength = 0.75 // 0.0 to 1.0
): Promise<AudioBuffer> {
  const sampleRate = sourceBuffer.sampleRate;
  const numChannels = sourceBuffer.numberOfChannels;
  const length = sourceBuffer.length;

  const offlineCtx = new OfflineAudioContext(numChannels, length, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = sourceBuffer;

  // 1. Steep Highpass filter to eliminate AC hum and low mic desk rumble
  const rumbleFilter = offlineCtx.createBiquadFilter();
  rumbleFilter.type = 'highpass';
  rumbleFilter.frequency.value = 85;
  rumbleFilter.Q.value = 0.707;

  // 2. High-shelf filter to tame hiss above 10.5kHz
  const hissFilter = offlineCtx.createBiquadFilter();
  hissFilter.type = 'highshelf';
  hissFilter.frequency.value = 10500;
  hissFilter.gain.value = -8 * strength;

  // 3. Dynamic Compressor to even out vocal speech and suppress low-level noise floor
  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.value = -32;
  compressor.knee.value = 12;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.005;
  compressor.release.value = 0.12;

  // Connect chain: source -> rumbleFilter -> hissFilter -> compressor -> destination
  source.connect(rumbleFilter);
  rumbleFilter.connect(hissFilter);
  hissFilter.connect(compressor);
  compressor.connect(offlineCtx.destination);

  source.start(0);
  const renderedBuffer = await offlineCtx.startRendering();

  // 4. Soft Software Noise Floor Gate on the rendered audio data
  // Suppress low-amplitude stationary noise frames below dynamic threshold
  const gateThreshold = 0.015 * strength;
  for (let c = 0; c < numChannels; c++) {
    const channelData = renderedBuffer.getChannelData(c);
    const frameSize = Math.floor(sampleRate * 0.015); // 15ms frame
    for (let i = 0; i < channelData.length; i += frameSize) {
      let sumSq = 0;
      const end = Math.min(i + frameSize, channelData.length);
      for (let j = i; j < end; j++) {
        sumSq += channelData[j] * channelData[j];
      }
      const rms = Math.sqrt(sumSq / (end - i));
      if (rms < gateThreshold) {
        // Attenuate noise frame smoothly
        const attenuation = Math.max(0.15, 1.0 - strength * 0.85);
        for (let j = i; j < end; j++) {
          channelData[j] *= attenuation;
        }
      }
    }
  }

  return renderedBuffer;
}
