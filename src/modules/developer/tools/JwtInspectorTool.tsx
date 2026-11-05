import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Copy, 
  Check, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  KeyRound
} from 'lucide-react';
import { inspectJwt, type JwtInspection } from '../engines/developerEngine';

const SAMPLE_JWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJraWQiOiJhdXRoMC1rZXktMDIifQ.eyJzdWIiOiJ1c3JfMTA0OTIiLCJuYW1lIjoiRmF0aW1hIFphaHJhIiwiZW1haWwiOiJmYXRpbWEuemFocmFAc2lmdHguZGV2Iiwicm9sZXMiOlsibGVhZF9kZXZlbG9wZXIiLCJhZG1pbiJdLCJpYXQiOjE3MDQxMTE2MDAsImV4cCI6MTgwMDAwMDAwMCwiaXNzIjoiaHR0cHM6Ly9hdXRoLnNpZnR4LmRldiJ9.dGhpcy1pcy1hLWZha2Utc2lnbmF0dXJlLWZvci1kZW1vLXB1cnBvc2Vz`;

export const JwtInspectorTool: React.FC = () => {
  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_JWT);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedHeader, setCopiedHeader] = useState(false);

  const inspected = useMemo<JwtInspection>(() => {
    return inspectJwt(tokenInput);
  }, [tokenInput]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">JWT Inspector & Security Debugger</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Client-Side Safe
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Decode and inspect JSON Web Tokens locally. Zero remote requests—your authorization secrets never leave your device.
            </p>
          </div>
        </div>

        <button
          onClick={() => setTokenInput(SAMPLE_JWT)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Load Sample JWT</span>
        </button>
      </div>

      {/* Raw Token Input */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Encoded JWT Token String</span>
          <span className="text-[11px] font-mono text-slate-400">{tokenInput.length} chars</span>
        </div>
        <textarea
          rows={3}
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Paste eyJhbGciOi... JWT token here"
          className="w-full p-3 bg-slate-900 text-amber-200 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none break-all"
          spellCheck={false}
        />
        {inspected.error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{inspected.error}</span>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {!inspected.error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Expiry Pill */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              inspected.isExpired ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Token Expiry Status</div>
              <div className={`text-xs font-black mt-0.5 ${inspected.isExpired ? 'text-rose-600' : 'text-emerald-600'}`}>
                {inspected.isExpired ? 'EXPIRED' : 'ACTIVE'} ({inspected.timeLeftFormatted || 'No exp claim'})
              </div>
            </div>
          </div>

          {/* Algorithm */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Algorithm & Type</div>
              <div className="text-xs font-black text-slate-800 mt-0.5">
                {inspected.header?.alg || 'None'} / {inspected.header?.typ || 'JWT'}
              </div>
            </div>
          </div>

          {/* Issued At */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issued At (iat)</div>
              <div className="text-xs font-black text-slate-700 mt-0.5">
                {inspected.issuedAt || 'Not specified'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decoded Header and Payload Grid */}
      {!inspected.error && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Decoded Header (4 cols) */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Decoded Header (Jose)</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspected.header, null, 2));
                  setCopiedHeader(true);
                  setTimeout(() => setCopiedHeader(false), 2000);
                }}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedHeader ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHeader ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-rose-300 font-mono text-xs rounded-xl overflow-x-auto">
              {JSON.stringify(inspected.header, null, 2)}
            </pre>
          </div>

          {/* Decoded Payload (8 cols) */}
          <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Decoded Payload (Claims & Data)</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspected.payload, null, 2));
                  setCopiedPayload(true);
                  setTimeout(() => setCopiedPayload(false), 2000);
                }}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPayload ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-indigo-300 font-mono text-xs rounded-xl overflow-x-auto min-h-[160px] leading-relaxed">
              {JSON.stringify(inspected.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
