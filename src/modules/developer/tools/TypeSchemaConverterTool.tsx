import React, { useState, useEffect } from 'react';
import { Copy, Check, Code2, RefreshCw, FileText, Download } from 'lucide-react';
import { 
  jsonToTypeScript, 
  jsonToZodSchema, 
  jsonToPydantic, 
  jsonToGoStruct 
} from '../engines/developerEngine';

const SAMPLE_JSON = `{
  "id": "usr_9921",
  "name": "Fatima Zahra",
  "email": "fatima.zahra@siftx.dev",
  "isVerified": true,
  "role": "lead_engineer",
  "profile": {
    "avatarUrl": "https://avatar.siftx.dev/u9921.png",
    "bio": "Building local-first developer tools in 2026",
    "skills": ["TypeScript", "Rust", "React", "Python"]
  },
  "metrics": {
    "commits": 1420,
    "rating": 4.98
  }
}`;

export const TypeSchemaConverterTool: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_JSON);
  const [targetLang, setTargetLang] = useState<'typescript' | 'zod' | 'pydantic' | 'go'>('typescript');
  const [rootName, setRootName] = useState<string>('User');
  const [outputCode, setOutputCode] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!jsonInput.trim()) {
      setOutputCode('');
      setErrorMsg(null);
      return;
    }

    let res: { code: string; error?: string } = { code: '' };

    if (targetLang === 'typescript') {
      res = jsonToTypeScript(jsonInput, rootName || 'Root');
    } else if (targetLang === 'zod') {
      res = jsonToZodSchema(jsonInput, (rootName || 'root') + 'Schema');
    } else if (targetLang === 'pydantic') {
      res = jsonToPydantic(jsonInput, rootName || 'RootModel');
    } else if (targetLang === 'go') {
      res = jsonToGoStruct(jsonInput, rootName || 'Root');
    }

    if (res.error) {
      setErrorMsg(res.error);
      setOutputCode('');
    } else {
      setErrorMsg(null);
      setOutputCode(res.code);
    }
  }, [jsonInput, targetLang, rootName]);

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!outputCode) return;
    const exts: Record<string, string> = {
      typescript: 'ts',
      zod: 'schema.ts',
      pydantic: 'py',
      go: 'go'
    };
    const blob = new Blob([outputCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rootName.toLowerCase() || 'model'}.${exts[targetLang]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Tool Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Universal Type & Schema Transpiler</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                2026 Core
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste raw JSON to generate TypeScript Interfaces, Zod Validation Schemas, Python Pydantic v2 & Go Structs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setJsonInput(SAMPLE_JSON)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Sample JSON</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input JSON */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Input JSON Data</span>
            </label>
            <span className="text-[11px] font-medium text-slate-400">
              {jsonInput.length} chars
            </span>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste raw JSON object or array here..."
              className="w-full h-[520px] p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-inner leading-relaxed"
              spellCheck={false}
            />
            {errorMsg && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-rose-950/90 border border-rose-800 text-rose-200 text-xs rounded-xl backdrop-blur-xs flex items-center gap-2">
                <span className="font-bold">JSON Error:</span>
                <span className="truncate">{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output Schema */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            {/* Target Language Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'typescript', label: 'TypeScript' },
                { id: 'zod', label: 'Zod 3' },
                { id: 'pydantic', label: 'Pydantic v2' },
                { id: 'go', label: 'Go Struct' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setTargetLang(lang.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    targetLang === lang.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Root Type Name */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Root Name:</span>
              <input
                type="text"
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                placeholder="e.g. User"
                className="w-28 px-2.5 py-1 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!outputCode}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={!outputCode}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer disabled:opacity-50"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Generated Code Display */}
          <div className="flex-1 relative">
            <textarea
              readOnly
              value={outputCode}
              placeholder="Generated schema will appear here..."
              className="w-full h-[470px] p-4 bg-slate-950 text-indigo-200 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none resize-none shadow-inner leading-relaxed"
              spellCheck={false}
            />
            {outputCode && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 rounded-md bg-slate-800 text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                  {targetLang}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
