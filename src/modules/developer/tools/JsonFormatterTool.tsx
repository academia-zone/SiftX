import React, { useState } from 'react';
import { 
  Braces, 
  Copy, 
  Check, 
  Minimize2, 
  AlertTriangle 
} from 'lucide-react';
import { formatJsonString, minifyJsonString } from '../engines/developerEngine';

const SAMPLE_JSON = `{
  "application": "SiftX Developer Studio",
  "version": "2.5.0",
  "isProduction": true,
  "settings": {
    "theme": "dark",
    "offlineMode": true,
    "maxTokens": 128000
  },
  "supportedTools": [
    "Type Converter",
    ".env Doctor",
    "JWT Inspector",
    "Regex Matcher"
  ]
}`;

export const JsonFormatterTool: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleBeautify = () => {
    const res = formatJsonString(jsonInput, indentSize);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setErrorMsg(null);
      setJsonInput(res.result);
    }
  };

  const handleMinify = () => {
    const res = minifyJsonString(jsonInput);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setErrorMsg(null);
      setJsonInput(res.result);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Braces className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">JSON Beautifier & Validator</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Syntax Tree
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Format, validate, repair, and minify JSON data with instant syntax error detection.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setIndentSize(2); handleBeautify(); }}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${indentSize === 2 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              2 Spaces
            </button>
            <button
              onClick={() => { setIndentSize(4); handleBeautify(); }}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${indentSize === 4 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              4 Spaces
            </button>
          </div>

          <button
            onClick={handleMinify}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify</span>
          </button>

          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
          </button>
        </div>
      </div>

      {/* Editor Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Invalid JSON: {errorMsg}</span>
          </div>
        )}

        <textarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value);
            setErrorMsg(null);
          }}
          placeholder="Paste JSON here..."
          className="w-full h-[520px] p-4 bg-slate-900 text-blue-200 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed resize-none shadow-inner"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
