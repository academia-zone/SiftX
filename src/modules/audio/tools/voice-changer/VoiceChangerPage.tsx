import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  Square, 
  Wand2, 
  CheckCircle2, 
  AlertCircle, 
  Sliders,
  Volume2,
  VolumeX,
  Layers,
  ArrowLeft,
  Upload,
  Check
} from 'lucide-react';
import { AudioUploadZone } from '../../shared/AudioUploadZone';
import { AudioPlayer } from '../../shared/AudioPlayer';
import type { VoiceEffect, AudioStudioRoute } from '../../types/audioTypes';
import { decodeAudioFile, applyVoiceEffect } from '../../shared/utils/audioDsp';
import { separateAudioStems, mixAudioStems, type SeparatedStems } from '../../shared/utils/stemSeparator';
import { encodeAudioBufferToWav } from '../../shared/utils/wavEncoder';

const EFFECTS: VoiceEffect[] = [
  { 
    id: 'documentary', 
    name: 'Documentary Narrator', 
    emoji: '🎙️', 
    desc: 'BBC & NatGeo style broadcast master with warm proximity, crisp air, and authoritative rhythm.', 
    tag: 'Studio Master' 
  },
  { 
    id: 'clean', 
    name: 'Pristine Studio Clean', 
    emoji: '✨', 
    desc: '100% authentic original voice with background fan noise, hiss, and room echo eliminated.', 
    tag: 'Pure Vocal' 
  },
  { 
    id: 'robot', 
    name: 'Cyber Robot', 
    emoji: '🤖', 
    desc: '50Hz carrier ring-modulation with synthetic metallic harmonics.', 
    tag: 'Ring Mod' 
  },
  { 
    id: 'chipmunk', 
    name: 'Chipmunk Pitch', 
    emoji: '🐿️', 
    desc: 'Accelerated pitch shift with bright harmonic elevation.', 
    tag: '1.38x Pitch' 
  },
  { 
    id: 'deep', 
    name: 'Cinematic Deep', 
    emoji: '🎬', 
    desc: 'Deep chest resonance with 220Hz low-shelf boost and pitch drop.', 
    tag: '0.76x Pitch' 
  },
  { 
    id: 'radio', 
    name: 'Vintage Radio', 
    emoji: '📻', 
    desc: 'Telephone bandpass (450Hz-2.8kHz) with analog saturation curve.', 
    tag: 'Bandpass' 
  },
  { 
    id: 'echo', 
    name: 'Cosmic Echo', 
    emoji: '🌌', 
    desc: 'Multi-tap feedback delay loop with high-frequency acoustic damping.', 
    tag: 'Delay Loop' 
  },
];

export const VoiceChangerPage: React.FC<{ onNavigate?: (route: AudioStudioRoute) => void }> = ({ onNavigate }) => {
  // Input states
  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [originalBuffer, setOriginalBuffer] = useState<AudioBuffer | null>(null);

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [activeMediaStream, setActiveMediaStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  // Multi-Track AI Stem Layers
  const [stems, setStems] = useState<SeparatedStems | null>(null);
  const [isSeparating, setIsSeparating] = useState(false);
  const [stemLevels, setStemLevels] = useState({
    vocal: { enabled: true, volume: 1.0 },
    fan: { enabled: false, volume: 0.0 }, // Fan muted by default for studio cleanliness
    chatter: { enabled: false, volume: 0.0 }, // Background chatter muted by default
  });

  // DSP Configuration
  const [selectedEffect, setSelectedEffect] = useState<VoiceEffect['id']>('documentary');
  const [effectIntensity, setEffectIntensity] = useState(100);

  // Output states
  const [isProcessing, setIsProcessing] = useState(false);
  const [transformedAudioUrl, setTransformedAudioUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cleanup URLs
  useEffect(() => {
    return () => {
      if (originalAudioUrl) URL.revokeObjectURL(originalAudioUrl);
      if (transformedAudioUrl) URL.revokeObjectURL(transformedAudioUrl);
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Process audio into stems
  const decomposeAudioIntoStems = async (buffer: AudioBuffer) => {
    try {
      setIsSeparating(true);
      const separated = await separateAudioStems(buffer);
      setStems(separated);
      // Default to Studio Isolation (Fan & Chatter muted)
      setStemLevels({
        vocal: { enabled: true, volume: 1.0 },
        fan: { enabled: false, volume: 0.0 },
        chatter: { enabled: false, volume: 0.0 },
      });
      setSuccessMsg('AI stem analysis complete: Isolated Vocal, Fan Noise, and Background Chatter layers.');
    } catch (err: any) {
      console.error('Stem separation error:', err);
      setErrorMsg('Could not decompose stems. Using standard audio buffer.');
    } finally {
      setIsSeparating(false);
    }
  };

  // Handle uploaded file
  const handleFileSelect = async (file: File) => {
    try {
      setErrorMsg(null);
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setOriginalAudioUrl(url);

      const buffer = await decodeAudioFile(file);
      setOriginalBuffer(buffer);
      setTransformedAudioUrl(null);

      // Trigger automatic stem separation
      await decomposeAudioIntoStems(buffer);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to decode audio file: ${err.message || 'Unsupported audio codec'}`);
    }
  };

  // Start Live Recording
  const startRecording = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setActiveMediaStream(stream);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const recordedFile = new File([audioBlob], `mic_record_${Date.now()}.webm`, { type: mimeType });
        setSelectedFile(recordedFile);

        const url = URL.createObjectURL(audioBlob);
        setOriginalAudioUrl(url);

        try {
          const buffer = await decodeAudioFile(audioBlob);
          setOriginalBuffer(buffer);
          setTransformedAudioUrl(null);
          await decomposeAudioIntoStems(buffer);
        } catch (err: any) {
          setErrorMsg(`Failed to process microphone audio: ${err.message}`);
        }
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordDuration(0);

      recordTimerRef.current = window.setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(`Microphone access error: ${err.message || 'Permission denied'}`);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      if (activeMediaStream) {
        activeMediaStream.getTracks().forEach(t => t.stop());
        setActiveMediaStream(null);
      }
    }
  };

  // Preset: Pure Studio Silence (Mute Fan & Chatter)
  const applyStudioSilence = () => {
    setStemLevels({
      vocal: { enabled: true, volume: 1.0 },
      fan: { enabled: false, volume: 0.0 },
      chatter: { enabled: false, volume: 0.0 },
    });
    setSuccessMsg('Studio Silence Active: Fan noise and background chatter muted.');
  };

  // Preset: Reset All Layers
  const resetAllLayers = () => {
    setStemLevels({
      vocal: { enabled: true, volume: 1.0 },
      fan: { enabled: true, volume: 1.0 },
      chatter: { enabled: true, volume: 1.0 },
    });
  };

  // Transform Voice & Render
  const handleTransform = async () => {
    if (!originalBuffer) {
      setErrorMsg('Please upload an audio file or record your voice first.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      // 1. Mix active stems
      let baseBuffer = originalBuffer;
      if (stems) {
        baseBuffer = await mixAudioStems(stems, stemLevels);
      }

      // 2. Apply selected voice effect & mastering
      const transformed = await applyVoiceEffect(
        baseBuffer,
        selectedEffect,
        effectIntensity / 100
      );

      // 3. Encode to playable WAV
      const wavBytes = encodeAudioBufferToWav(transformed);
      const wavBlob = new Blob([wavBytes as any], { type: 'audio/wav' });
      if (transformedAudioUrl) URL.revokeObjectURL(transformedAudioUrl);
      const outputUrl = URL.createObjectURL(wavBlob);
      setTransformedAudioUrl(outputUrl);

      const activeEffectObj = EFFECTS.find(e => e.id === selectedEffect);
      setSuccessMsg(`Mastered with ${activeEffectObj?.name || 'Studio Effect'} successfully.`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Transformation error: ${err.message || 'Internal DSP failure'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Top Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {onNavigate && (
          <button
            onClick={() => onNavigate('/audio')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0176fd] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Audio Studio</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Stem Separator & Documentary Vocal Master</span>
          </span>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <p className="font-semibold">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="font-semibold">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 text-xs font-bold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Main 2-Column Clean Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input & AI Stem Layer Mixer (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          
          {/* Input Method Switcher */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setInputMode('upload')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  inputMode === 'upload'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Audio File</span>
              </button>

              <button
                type="button"
                onClick={() => setInputMode('record')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  inputMode === 'record'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>Record Microphone</span>
              </button>
            </div>

            {selectedFile && (
              <span className="text-xs font-medium text-slate-400 truncate max-w-[200px]">
                {selectedFile.name}
              </span>
            )}
          </div>

          {/* Upload or Record Area */}
          {inputMode === 'upload' ? (
            <AudioUploadZone
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClear={() => {
                setSelectedFile(null);
                setOriginalBuffer(null);
                setStems(null);
                if (originalAudioUrl) URL.revokeObjectURL(originalAudioUrl);
                setOriginalAudioUrl(null);
                if (transformedAudioUrl) URL.revokeObjectURL(transformedAudioUrl);
                setTransformedAudioUrl(null);
              }}
              className="py-8"
            />
          ) : (
            <div className="p-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0176fd] flex items-center justify-center shadow-inner">
                <Mic className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900">
                  {isRecording ? 'Recording in progress...' : 'Record your voice or documentary narration'}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Speak normally. Laptop fan, room echo, and background chatter can be removed below.
                </p>
              </div>

              {isRecording ? (
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-mono font-bold animate-pulse flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    <span>{Math.floor(recordDuration / 60)}:{(recordDuration % 60).toString().padStart(2, '0')}</span>
                  </span>

                  <button
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Recording</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  className="px-6 py-3 rounded-2xl bg-[#0176fd] hover:bg-[#005cd6] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/25 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Recording</span>
                </button>
              )}
            </div>
          )}

          {/* AI VOICE STEM SEPARATOR (3 DISTINCT LAYERS) */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0176fd]" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  AI Voice Layer Separator (3 Stems)
                </h3>
              </div>

              {/* 1-Click Studio Isolation Preset */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={applyStudioSilence}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Mutes fan noise and background chatter with one click"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Studio Silence (Remove Noise)</span>
                </button>

                <button
                  type="button"
                  onClick={resetAllLayers}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {isSeparating ? (
              <div className="p-6 rounded-2xl bg-blue-50/60 border border-blue-100 text-center space-y-2 animate-pulse">
                <div className="inline-block w-6 h-6 border-2 border-[#0176fd] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-[#0176fd]">
                  Analyzing frequency spectrum and decomposing audio into stems...
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                
                {/* LAYER 1: Main Speaker Voice */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  stemLevels.vocal.enabled
                    ? 'border-blue-200 bg-blue-50/40'
                    : 'border-slate-100 bg-slate-50 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center">
                        L1
                      </span>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>Main Speaker Voice</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Human Vocal Core
                          </span>
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Primary speech phonemes and vocal presence.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStemLevels(prev => ({
                        ...prev,
                        vocal: { ...prev.vocal, enabled: !prev.vocal.enabled }
                      }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        stemLevels.vocal.enabled
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {stemLevels.vocal.enabled ? 'Active' : 'Muted'}
                    </button>
                  </div>

                  {stemLevels.vocal.enabled && (
                    <div className="flex items-center gap-3 pt-1">
                      <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={stemLevels.vocal.volume}
                        onChange={(e) => setStemLevels(prev => ({
                          ...prev,
                          vocal: { ...prev.vocal, volume: parseFloat(e.target.value) }
                        }))}
                        className="w-full accent-blue-600 cursor-pointer h-1.5"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600 w-8 text-right">
                        {Math.round(stemLevels.vocal.volume * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* LAYER 2: Fan & Ambient Noise (Laptop Fan, AC Drone) */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  stemLevels.fan.enabled
                    ? 'border-amber-200 bg-amber-50/40'
                    : 'border-slate-200/80 bg-slate-50/70'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center">
                        L2
                      </span>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>Fan & Ambient Noise</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            !stemLevels.fan.enabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {!stemLevels.fan.enabled ? 'Filtered Out' : 'Active Noise'}
                          </span>
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Laptop cooling fan drone, air turbulence hiss, and AC motor rumble.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStemLevels(prev => ({
                        ...prev,
                        fan: { ...prev.fan, enabled: !prev.fan.enabled, volume: !prev.fan.enabled ? 1.0 : 0.0 }
                      }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                        !stemLevels.fan.enabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {!stemLevels.fan.enabled ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>Muted (Clean)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Include Fan</span>
                        </>
                      )}
                    </button>
                  </div>

                  {stemLevels.fan.enabled && (
                    <div className="flex items-center gap-3 pt-1">
                      <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={stemLevels.fan.volume}
                        onChange={(e) => setStemLevels(prev => ({
                          ...prev,
                          fan: { ...prev.fan, volume: parseFloat(e.target.value) }
                        }))}
                        className="w-full accent-amber-500 cursor-pointer h-1.5"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600 w-8 text-right">
                        {Math.round(stemLevels.fan.volume * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* LAYER 3: Background Chatter & Room Murmurs */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  stemLevels.chatter.enabled
                    ? 'border-purple-200 bg-purple-50/40'
                    : 'border-slate-200/80 bg-slate-50/70'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                        L3
                      </span>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>Background Chatter & Crying</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            !stemLevels.chatter.enabled
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {!stemLevels.chatter.enabled ? 'Filtered Out' : 'Active Bleed'}
                          </span>
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Secondary voices, kids shouting in other rooms, coughing, and distant room reverberation.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStemLevels(prev => ({
                        ...prev,
                        chatter: { ...prev.chatter, enabled: !prev.chatter.enabled, volume: !prev.chatter.enabled ? 1.0 : 0.0 }
                      }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1 ${
                        !stemLevels.chatter.enabled
                          ? 'bg-emerald-600 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {!stemLevels.chatter.enabled ? (
                        <>
                          <VolumeX className="w-3 h-3" />
                          <span>Muted (Clean)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Include Chatter</span>
                        </>
                      )}
                    </button>
                  </div>

                  {stemLevels.chatter.enabled && (
                    <div className="flex items-center gap-3 pt-1">
                      <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={stemLevels.chatter.volume}
                        onChange={(e) => setStemLevels(prev => ({
                          ...prev,
                          chatter: { ...prev.chatter, volume: parseFloat(e.target.value) }
                        }))}
                        className="w-full accent-purple-600 cursor-pointer h-1.5"
                      />
                      <span className="text-xs font-mono font-bold text-slate-600 w-8 text-right">
                        {Math.round(stemLevels.chatter.volume * 100)}%
                      </span>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Original Audio Preview */}
          {originalAudioUrl && (
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Raw Input Audio:
              </span>
              <AudioPlayer
                src={originalAudioUrl}
                title="Input Recording"
                subtitle="Raw Unprocessed Audio"
              />
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Voice Transformation & Studio Mastering (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-6">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Voice Transformation
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {EFFECTS.length} Modes
              </span>
            </div>

            {/* Effect Cards List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {EFFECTS.map((eff) => {
                const isSelected = selectedEffect === eff.id;

                return (
                  <div
                    key={eff.id}
                    onClick={() => setSelectedEffect(eff.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      isSelected
                        ? 'border-[#0176fd] bg-blue-50/50 shadow-sm ring-2 ring-[#0176fd]/20'
                        : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="text-2xl flex-shrink-0 mt-0.5 select-none">
                      {eff.emoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className="font-extrabold text-sm text-slate-900 truncate">
                          {eff.name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {eff.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {eff.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#0176fd] flex-shrink-0 mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Effect Intensity Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Effect Intensity:</span>
              </span>
              <span className="text-[#0176fd] font-mono">{effectIntensity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={effectIntensity}
              onChange={(e) => setEffectIntensity(parseInt(e.target.value))}
              className="w-full accent-[#0176fd] cursor-pointer h-1.5"
            />
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleTransform}
            disabled={!originalBuffer || isProcessing || isSeparating}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#0176fd] hover:bg-[#005cd6] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] disabled:opacity-40"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mastering Audio with {EFFECTS.find(e => e.id === selectedEffect)?.name}...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Apply Stem Isolation & Master Voice</span>
              </>
            )}
          </button>

          {/* Transformed Audio Player Result */}
          {transformedAudioUrl && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Studio Master Ready:</span>
              </span>
              <AudioPlayer
                src={transformedAudioUrl}
                title={`${EFFECTS.find(e => e.id === selectedEffect)?.name || 'Transformed'} Voice`}
                subtitle="Cleaned Stems • Studio Mastered"
                downloadFilename={`siftx_voice_${selectedEffect}_${Date.now()}.wav`}
              />
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
