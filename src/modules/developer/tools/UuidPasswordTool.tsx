import React, { useState } from 'react';
import { 
  KeyRound, 
  Copy, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { generateCryptoUuid, generateSecurePassword } from '../engines/developerEngine';

export const UuidPasswordTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'uuid' | 'password'>('uuid');
  
  // UUID States
  const [uuidCount, setUuidCount] = useState<number>(5);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [uuidHyphens, setUuidHyphens] = useState<boolean>(true);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>(() => [
    generateCryptoUuid(),
    generateCryptoUuid(),
    generateCryptoUuid(),
    generateCryptoUuid(),
    generateCryptoUuid()
  ]);

  // Password States
  const [passLength, setPassLength] = useState<number>(20);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [generatedPass, setGeneratedPass] = useState<string>(() => generateSecurePassword(20, true));

  const [copied, setCopied] = useState<boolean>(false);

  const handleRegenerateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      let u = generateCryptoUuid();
      if (!uuidHyphens) u = u.replace(/-/g, '');
      if (uuidUppercase) u = u.toUpperCase();
      list.push(u);
    }
    setGeneratedUuids(list);
  };

  const handleRegeneratePassword = () => {
    setGeneratedPass(generateSecurePassword(passLength, includeSymbols));
  };

  const handleCopyUuids = () => {
    navigator.clipboard.writeText(generatedUuids.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">UUID & Secure Secret Key Generator</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Web Crypto API
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate cryptographically strong UUID v4 identifiers in bulk or create uncrackable API secrets and passwords.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('uuid')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'uuid' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'}`}
          >
            UUID v4 Bulk
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'password' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'}`}
          >
            Secret & Password
          </button>
        </div>
      </div>

      {activeTab === 'uuid' ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <span className="font-bold">Quantity:</span>
                <select
                  value={uuidCount}
                  onChange={(e) => setUuidCount(Number(e.target.value))}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                >
                  <option value={1}>1 UUID</option>
                  <option value={5}>5 UUIDs</option>
                  <option value={10}>10 UUIDs</option>
                  <option value={25}>25 UUIDs</option>
                  <option value={50}>50 UUIDs</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidUppercase}
                  onChange={(e) => setUuidUppercase(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Uppercase</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uuidHyphens}
                  onChange={(e) => setUuidHyphens(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Include Hyphens</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerateUuids}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerate</span>
              </button>

              <button
                onClick={handleCopyUuids}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied All!' : 'Copy All'}</span>
              </button>
            </div>
          </div>

          {/* Generated UUIDs List */}
          <div className="space-y-2">
            {generatedUuids.map((u, idx) => (
              <div
                key={idx}
                onClick={() => navigator.clipboard.writeText(u)}
                className="p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl flex items-center justify-between hover:bg-slate-800 transition cursor-pointer group"
              >
                <span>{u}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 font-sans">
                  Click to copy
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          {/* Output Display */}
          <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <span className="font-mono text-sm sm:text-base font-bold text-emerald-300 break-all">
              {generatedPass}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRegeneratePassword}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopyPassword}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Password'}</span>
              </button>
            </div>
          </div>

          {/* Customization Controls */}
          <div className="space-y-4 max-w-lg">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Password Length</span>
                <span className="font-mono text-emerald-600">{passLength} characters</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={passLength}
                onChange={(e) => {
                  setPassLength(Number(e.target.value));
                  setGeneratedPass(generateSecurePassword(Number(e.target.value), includeSymbols));
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => {
                  setIncludeSymbols(e.target.checked);
                  setGeneratedPass(generateSecurePassword(passLength, e.target.checked));
                }}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Include Special Symbols (!@#$%^&*...)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
