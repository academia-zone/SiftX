import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  FileText, 
  Coins, 
  Zap, 
  Sliders 
} from 'lucide-react';
import { optimizePromptContext } from '../engines/developerEngine';

const SAMPLE_PROMPT = `// ==========================================
// User Authentication Service (Legacy Module)
// Author: Dev Team
// Created: 2024-05-12
// ==========================================

/*
  This module handles user sessions, JWT token generation,
  and role-based access control.
*/

function authenticateUser(credentials) {
  // Validate input parameters
  if (!credentials || !credentials.email) {
    throw new Error("Invalid credentials payload");
  }

  // Debug payload
  console.log("Authenticating email:", credentials.email);

  const config = {
    "timeoutMs": 5000,
    "retryCount": 3,
    "endpoints": {
      "auth": "https://auth.internal.api/v2",
      "metrics": "https://metrics.internal.api/log"
    }
  };

  return {
    success: true,
    user: {
      id: "u_9921",
      email: credentials.email,
      roles: ["admin", "developer"]
    }
  };
}

# Python Helper Script (Included in Context)
def calculate_permissions(user_roles):
    # Iterate through roles and grant access
    permissions = []
    for role in user_roles:
        # Check superadmin privileges
        if role == "admin":
            permissions.append("ALL")
    return permissions
`;

export const AiContextOptimizerTool: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SAMPLE_PROMPT);
  const [removeComments, setRemoveComments] = useState<boolean>(true);
  const [removeBlankLines, setRemoveBlankLines] = useState<boolean>(true);
  const [condenseJson, setCondenseJson] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const result = useMemo(() => {
    return optimizePromptContext(inputText, {
      removeComments,
      removeBlankLines,
      condenseJson
    });
  }, [inputText, removeComments, removeBlankLines, condenseJson]);

  const handleCopy = () => {
    if (!result.optimizedText) return;
    navigator.clipboard.writeText(result.optimizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">AI Context Optimizer & Token Calculator</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                2026 AI-Native
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Shrink prompt context size, strip dead comments, calculate exact tokens, and estimate API costs across Gemini, Claude & GPT-4o.
            </p>
          </div>
        </div>

        <button
          onClick={() => setInputText(SAMPLE_PROMPT)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Load Sample Prompt</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Original Tokens</div>
          <div className="text-2xl font-black text-slate-700 mt-1">{result.originalTokens.toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Optimized Tokens</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{result.optimizedTokens.toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Tokens Saved</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">-{result.savedTokens.toLocaleString()}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">Compression</div>
          <div className="text-2xl font-black text-violet-600 mt-1">-{result.compressionRatio}%</div>
        </div>
      </div>

      {/* Optimization Toggles Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Sliders className="w-4 h-4 text-violet-600" />
          <span>Compression Rules:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={removeComments}
              onChange={(e) => setRemoveComments(e.target.checked)}
              className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
            />
            <span>Strip Code Comments (//, /* */, #, &lt;!-- --&gt;)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={removeBlankLines}
              onChange={(e) => setRemoveBlankLines(e.target.checked)}
              className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
            />
            <span>Collapse Blank Lines</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={condenseJson}
              onChange={(e) => setCondenseJson(e.target.checked)}
              className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
            />
            <span>Minify Embedded JSON</span>
          </label>
        </div>

        <button
          onClick={handleCopy}
          disabled={!result.optimizedText}
          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-violet-500/20 cursor-pointer disabled:opacity-50"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Prompt!' : 'Copy Optimized Prompt'}</span>
        </button>
      </div>

      {/* Main Split Textareas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Raw Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Original Prompt / Code Context</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">{inputText.length} chars</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste code or prompt context..."
            className="w-full h-80 p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Compressed Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span>AI-Optimized Context</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-600 font-bold">{result.optimizedText.length} chars</span>
          </div>
          <textarea
            readOnly
            value={result.optimizedText}
            placeholder="Compressed prompt output..."
            className="w-full h-80 p-4 bg-slate-950 text-violet-200 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none resize-none leading-relaxed shadow-inner"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Estimated Model Cost Savings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-800">2026 Model Input Cost Comparison (per prompt run)</h3>
          </div>
          <span className="text-[11px] text-slate-400">Based on standard 1M token rates</span>
        </div>

        <div className="divide-y divide-slate-100">
          {result.costEstimates.map((est) => (
            <div key={est.model} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition">
              <span className="font-bold text-slate-800">{est.model}</span>
              <div className="flex items-center gap-6 font-mono text-right">
                <div>
                  <div className="text-[10px] text-slate-400">Original</div>
                  <div className="text-slate-600 font-medium">${est.originalCost}</div>
                </div>
                <div>
                  <div className="text-[10px] text-emerald-600 font-bold">Optimized</div>
                  <div className="text-emerald-600 font-bold">${est.optimizedCost}</div>
                </div>
                <div>
                  <div className="text-[10px] text-indigo-600 font-bold">Saved</div>
                  <div className="text-indigo-600 font-bold">${est.savings}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
