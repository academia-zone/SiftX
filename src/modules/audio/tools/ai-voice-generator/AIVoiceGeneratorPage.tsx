import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  Square, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Sliders,
  Radio
} from 'lucide-react';
import { AI_PERSONAS, generateAIVoice } from '../../services/aiVoiceService';
import type { VoicePersona } from '../../types/audioTypes';
import { AudioPlayer } from '../../shared/AudioPlayer';

const PRESET_SCRIPTS: { label: string; text: string }[] = [
  {
    label: 'Product Demo',
    text: 'Meet SiftX Audio Studio. A completely private, high-fidelity audio workstation built directly into your browser. No cloud latency, no tracking.',
  },
  {
    label: 'Podcast Intro',
    text: 'Welcome back to the Future Tech Digest! In today’s episode, we break down the newest breakthroughs in modern machine learning and audio engineering.',
  },
  {
    label: 'Story Narration',
    text: 'Deep within the ancient mountains, a faint mechanical hum resonated through the stone corridors. The long-abandoned observatory had finally awakened.',
  },
  {
    label: 'Urdu / Nastaliq',
    text: 'سیفٹ ایکس اسٹوڈیو میں خوش آمدید۔ یہاں آپ اپنی تحریر کو فوری طور پر قدرتی آواز میں تبدیل کر سکتے ہیں۔',
  },
  {
    label: 'Roman Urdu',
    text: 'SiftX Audio Studio me khush amdeed. Yahan aap text ko natural aur crystal clear voice me convert kar saktay hain.',
  },
];

export const AIVoiceGeneratorPage: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(AI_PERSONAS[0]);
  const [script, setScript] = useState(
    'Welcome to SiftX Audio Studio. Transform your scripts into lifelike voiceovers with expressive acoustic personas.'
  );
  const [cadence, setCadence] = useState(85); // 60% to 120%
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [previewingPersonaId, setPreviewingPersonaId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Persona Sample Preview
  const handlePreviewPersona = async (persona: VoicePersona, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingPersonaId === persona.id) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setPreviewingPersonaId(null);
      return;
    }

    try {
      setPreviewingPersonaId(persona.id);
      await generateAIVoice(persona.previewSample, persona, 80);
    } catch (err) {
      console.warn('Sample preview error:', err);
    } finally {
      // Small timeout to reset preview state
      setTimeout(() => setPreviewingPersonaId(null), 3000);
    }
  };

  // Generate full script voice
  const handleGenerate = async () => {
    if (!script.trim()) {
      setErrorMsg('Please enter a script or select a preset template.');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const url = await generateAIVoice(script, selectedPersona, cadence);
      
      if (url) {
        if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl);
        setGeneratedAudioUrl(url);
        setSuccessMsg(`Generated voiceover with ${selectedPersona.name.split('—')[0].trim()}!`);
      } else {
        setSuccessMsg('Spoken playback started directly through your browser audio engine.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate voice');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
              Acoustic Personas
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
              High-Fidelity Neural
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            AI Voice Generator
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Produce rich spoken voiceovers calibrated for documentaries, podcasts, commercials, and digital interfaces.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-3 text-emerald-800 dark:text-emerald-200 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          <div className="flex-1">{successMsg}</div>
        </div>
      )}

      {/* Persona Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Step 1: Choose Persona
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Click card to select • Press play to preview timbre
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_PERSONAS.map((persona) => {
            const isSelected = selectedPersona.id === persona.id;
            const isPreviewing = previewingPersonaId === persona.id;

            return (
              <div
                key={persona.id}
                onClick={() => setSelectedPersona(persona)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 dark:border-purple-500 shadow-md ring-2 ring-purple-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {persona.name}
                    </h3>
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mt-0.5">
                      {persona.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handlePreviewPersona(persona, e)}
                    className={`p-2 rounded-full transition-all ${
                      isPreviewing
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                    title="Play voice preview sample"
                  >
                    {isPreviewing ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {persona.tone}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="capitalize">{persona.gender}</span>
                  <span>•</span>
                  <span>Pitch: {persona.pitchMultiplier}x</span>
                  <span>•</span>
                  <span>Speed: {persona.rateMultiplier}x</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Script Input & Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Step 2: Enter Voiceover Script
              </h2>
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 mr-1">Templates:</span>
                {PRESET_SCRIPTS.map((ps) => (
                  <button
                    key={ps.label}
                    type="button"
                    onClick={() => setScript(ps.text)}
                    className="px-2 py-0.5 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    {ps.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={6}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Type or paste your narrative script here..."
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-normal leading-relaxed text-sm resize-none"
            />

            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>{script.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>{script.length} characters</span>
            </div>
          </div>
        </div>

        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Cadence & Delivery
            </h2>

            {/* Selected Persona Summary */}
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/40">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider block">
                Active Persona
              </span>
              <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                {selectedPersona.name.split('—')[0].trim()}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {selectedPersona.role}
              </p>
            </div>

            {/* Pacing Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                <span>Pacing / Cadence</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{cadence}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="125"
                value={cadence}
                onChange={(e) => setCadence(Number(e.target.value))}
                className="w-full accent-purple-600 dark:accent-purple-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Deliberate</span>
                <span>Balanced</span>
                <span>Brisk</span>
              </div>
            </div>

            {/* Action */}
            <button
              type="button"
              disabled={isGenerating || !script.trim()}
              onClick={handleGenerate}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all text-sm"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Synthesizing Speech...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate AI Voiceover
                </>
              )}
            </button>
          </div>

          {/* Result Player */}
          {generatedAudioUrl && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-500/30 dark:border-purple-400/20 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Voiceover Master (Ready)
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Audio Stream
                </span>
              </div>

              <AudioPlayer
                src={generatedAudioUrl}
                title={`${selectedPersona.name.split('—')[0].trim()} Voiceover`}
                subtitle={`${selectedPersona.role} • Cadence: ${cadence}%`}
                downloadFileName={`ai_voice_${selectedPersona.id}.mp3`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
