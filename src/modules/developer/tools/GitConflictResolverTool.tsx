import React, { useState, useMemo } from 'react';
import { 
  GitMerge, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Code2
} from 'lucide-react';
import { 
  parseGitConflicts, 
  assembleResolvedGitConflict 
} from '../engines/developerEngine';

const SAMPLE_CONFLICT = `import React from 'react';
import { Button } from './components/Button';

export const UserProfile = () => {
<<<<<<< HEAD
  // Current branch: Add dark mode toggle
  const [theme, setTheme] = useState('dark');
  const primaryColor = '#4f46e5';
=======
  // Incoming branch: Add localization support
  const [locale, setLocale] = useState('ur-PK');
  const primaryColor = '#059669';
>>>>>>> feature/localization

  return (
    <div className="p-6">
<<<<<<< HEAD
      <h1 className="text-xl font-bold">User Dashboard (Dark)</h1>
=======
      <h1 className="text-xl font-bold">صارف ڈیش بورڈ (Urdu)</h1>
>>>>>>> feature/localization
      <Button color={primaryColor}>Save Settings</Button>
    </div>
  );
};`;

export const GitConflictResolverTool: React.FC = () => {
  const [rawText, setRawText] = useState<string>(SAMPLE_CONFLICT);
  const [resolutions, setResolutions] = useState<Record<string, 'ours' | 'theirs' | 'both'>>({});
  const [copied, setCopied] = useState<boolean>(false);

  const parsed = useMemo(() => {
    return parseGitConflicts(rawText);
  }, [rawText]);

  const resolvedCode = useMemo(() => {
    return assembleResolvedGitConflict(rawText, resolutions);
  }, [rawText, resolutions]);

  const handleSetResolution = (blockId: string, choice: 'ours' | 'theirs' | 'both') => {
    setResolutions(prev => ({
      ...prev,
      [blockId]: choice
    }));
  };

  const handleCopyResolved = () => {
    navigator.clipboard.writeText(resolvedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <GitMerge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Visual Git Merge Conflict Solver</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {parsed.blocks.length} Conflicts Detected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste merge conflict files with &lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD markers and resolve them visually with 1-click accept buttons.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setRawText(SAMPLE_CONFLICT);
            setResolutions({});
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Sample Conflict</span>
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Interactive Conflict Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Paste Conflict File Content</label>
            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setResolutions({});
              }}
              placeholder="Paste text with <<<<<<< HEAD ... ======= ... >>>>>>>"
              className="w-full h-44 p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Interactive Conflict Cards */}
          <div className="space-y-4">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Interactive Conflict Blocks ({parsed.blocks.length})</span>
            </h2>

            {parsed.blocks.length === 0 ? (
              <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center text-xs font-bold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>No Git conflict markers found! Clean code.</span>
              </div>
            ) : (
              parsed.blocks.map((block, idx) => {
                const currentChoice = resolutions[block.id] || 'ours';

                return (
                  <div key={block.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Conflict #{idx + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSetResolution(block.id, 'ours')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            currentChoice === 'ours'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          Accept Current (Ours)
                        </button>

                        <button
                          onClick={() => handleSetResolution(block.id, 'theirs')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            currentChoice === 'theirs'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          Accept Incoming (Theirs)
                        </button>

                        <button
                          onClick={() => handleSetResolution(block.id, 'both')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            currentChoice === 'both'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                        >
                          Combine Both
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs font-mono">
                      {/* Ours */}
                      <div className={`p-3 space-y-1 ${currentChoice === 'ours' ? 'bg-emerald-50/50' : ''}`}>
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">
                          {block.currentLabel}
                        </div>
                        <pre className="p-2 bg-slate-900 text-emerald-300 rounded-lg overflow-x-auto text-[11px] leading-relaxed">
                          {block.currentOurs.trim() || '<empty>'}
                        </pre>
                      </div>

                      {/* Theirs */}
                      <div className={`p-3 space-y-1 ${currentChoice === 'theirs' ? 'bg-blue-50/50' : ''}`}>
                        <div className="text-[10px] font-bold text-blue-700 uppercase">
                          {block.incomingLabel}
                        </div>
                        <pre className="p-2 bg-slate-900 text-blue-300 rounded-lg overflow-x-auto text-[11px] leading-relaxed">
                          {block.incomingTheirs.trim() || '<empty>'}
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Clean Resolved Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span>Resolved Code Preview</span>
            </span>
            <button
              onClick={handleCopyResolved}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-emerald-500/20 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Clean Code!' : 'Copy Resolved Code'}</span>
            </button>
          </div>

          <div className="flex-1 relative">
            <textarea
              readOnly
              value={resolvedCode}
              placeholder="Resolved code will appear here..."
              className="w-full h-[540px] p-4 bg-slate-950 text-emerald-200 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none resize-none shadow-inner leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
