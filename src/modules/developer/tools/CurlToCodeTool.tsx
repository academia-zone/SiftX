import React, { useState, useMemo } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { transpileCurl, type TranspiledCurl } from '../engines/developerEngine';

const SAMPLE_CURL = `curl -X POST "https://api.siftx.dev/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer test_token_xyz" \\
  -d '{"email": "fatima.zahra@siftx.dev", "rememberMe": true}'`;

export const CurlToCodeTool: React.FC = () => {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL);
  const [activeLang, setActiveLang] = useState<'fetch' | 'axios' | 'python' | 'go'>('fetch');
  const [copied, setCopied] = useState<boolean>(false);

  const transpiled = useMemo<TranspiledCurl>(() => {
    return transpileCurl(curlInput);
  }, [curlInput]);

  const activeCode = useMemo(() => {
    if (activeLang === 'fetch') return transpiled.fetchCode;
    if (activeLang === 'axios') return transpiled.axiosCode;
    if (activeLang === 'python') return transpiled.pythonCode;
    return transpiled.goCode;
  }, [activeLang, transpiled]);

  const handleCopy = () => {
    if (!activeCode) return;
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">cURL to Code Transpiler</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                Multi-Language
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste cURL requests from Chrome DevTools or Postman and convert directly to Fetch, Axios, Python Requests, or Go.
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurlInput(SAMPLE_CURL)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample cURL</span>
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: cURL Input (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Paste cURL Command</span>
            <span className="text-[11px] font-mono text-slate-400">{curlInput.length} chars</span>
          </div>

          <textarea
            value={curlInput}
            onChange={(e) => setCurlInput(e.target.value)}
            placeholder="curl -X POST https://api..."
            className="w-full h-[480px] p-4 bg-slate-900 text-amber-200 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none leading-relaxed"
            spellCheck={false}
          />

          {transpiled.error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {transpiled.error}
            </div>
          )}
        </div>

        {/* Right Column: Code Output (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Language Switcher Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'fetch', label: 'JS Fetch' },
                { id: 'axios', label: 'JS Axios' },
                { id: 'python', label: 'Python Requests' },
                { id: 'go', label: 'Go net/http' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setActiveLang(lang.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeLang === lang.id
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              disabled={!activeCode}
              className="px-4 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-orange-500/20 cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Generated Code Area */}
          <div className="flex-1 relative">
            <textarea
              readOnly
              value={activeCode}
              placeholder="Generated code will appear here..."
              className="w-full h-[430px] p-4 bg-slate-950 text-orange-200 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none resize-none shadow-inner leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
