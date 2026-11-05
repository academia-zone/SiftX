import React, { useState, useMemo } from 'react';
import { 
  Regex, 
  Copy, 
  Check, 
  AlertTriangle, 
  BookOpen 
} from 'lucide-react';

const REGEX_PRESETS = [
  { name: 'Email Address', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: 'gm' },
  { name: 'HTTP / HTTPS URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', flags: 'gi' },
  { name: 'IPv4 Address', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b', flags: 'g' },
  { name: 'Hex Color (#fff / #ffffff)', pattern: '#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\\b', flags: 'gi' },
  { name: 'ISO Date (YYYY-MM-DD)', pattern: '\\b\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b', flags: 'g' },
  { name: 'JWT Token Pattern', pattern: 'ey[a-zA-Z0-9_-]+\\.ey[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+', flags: 'g' }
];

const SAMPLE_TEST_TEXT = `Welcome to SiftX 2026 Developer Studio!
Contact our lead engineer at fatima.zahra@siftx.dev or support@toolkit.io.
Our test server IP is 192.168.1.105 and production gateway is 10.0.0.1.
Website link: https://siftx.dev/docs?ref=universal_tool
Brand theme colors: #4f46e5 (Indigo) and #059669 (Emerald).
Release milestone: 2026-11-04.`;

export const RegexTesterTool: React.FC = () => {
  const [pattern, setPattern] = useState<string>('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState<string>('g');
  const [testString, setTestString] = useState<string>(SAMPLE_TEST_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  const matchAnalysis = useMemo(() => {
    try {
      if (!pattern) return { matches: [], error: null };
      const regex = new RegExp(pattern, flags);
      const matches: { text: string; index: number; groups: string[] }[] = [];

      if (flags.includes('g')) {
        let m;
        while ((m = regex.exec(testString)) !== null) {
          matches.push({
            text: m[0],
            index: m.index,
            groups: m.slice(1)
          });
          if (regex.lastIndex === m.index) {
            regex.lastIndex++; // prevent infinite loops with zero-length matches
          }
        }
      } else {
        const m = regex.exec(testString);
        if (m) {
          matches.push({
            text: m[0],
            index: m.index,
            groups: m.slice(1)
          });
        }
      }

      return { matches, error: null };
    } catch (err: any) {
      return { matches: [], error: err.message };
    }
  }, [pattern, flags, testString]);

  const toggleFlag = (flagChar: string) => {
    if (flags.includes(flagChar)) {
      setFlags(flags.replace(flagChar, ''));
    } else {
      setFlags(flags + flagChar);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Regex className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Visual Regex Tester & Matcher</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200">
                {matchAnalysis.matches.length} Matches Found
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time regex pattern evaluation with match group extraction, flags selector, and common presets.
            </p>
          </div>
        </div>

        {/* Copy Pattern Button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(`/${pattern}/${flags}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-sm shadow-pink-500/20 cursor-pointer self-start md:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Regex!' : 'Copy Regex'}</span>
        </button>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Presets:</span>
        </span>
        {REGEX_PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => {
              setPattern(p.pattern);
              setFlags(p.flags);
            }}
            className="text-xs px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-pink-300 hover:text-pink-600 text-slate-700 font-medium transition shrink-0 cursor-pointer shadow-xs"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Pattern & Flags Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-mono font-bold text-slate-400">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Regular expression pattern..."
            className="flex-1 px-3 py-2 text-xs font-mono font-bold bg-slate-900 text-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 border border-slate-800"
          />
          <span className="text-lg font-mono font-bold text-slate-400">/</span>

          {/* Flags Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-mono font-bold">
            {['g', 'i', 'm', 's'].map((f) => {
              const active = flags.includes(f);
              return (
                <button
                  key={f}
                  onClick={() => toggleFlag(f)}
                  className={`w-7 h-7 rounded-lg transition cursor-pointer flex items-center justify-center ${
                    active ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                  title={`Flag: ${f}`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {matchAnalysis.error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Invalid Regex: {matchAnalysis.error}</span>
          </div>
        )}
      </div>

      {/* Main Split: Test String vs Extracted Matches Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Test String (6 cols) */}
        <div className="lg:col-span-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Test String</span>
            <span className="text-[11px] font-mono text-slate-400">{testString.length} chars</span>
          </div>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="Enter test text here to test matches..."
            className="w-full h-80 p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Right Column: Matched Results Table (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Matched Items ({matchAnalysis.matches.length})
            </h3>
            <span className="text-[11px] text-slate-400">Click item to copy</span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-80 divide-y divide-slate-100 p-2">
            {matchAnalysis.matches.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No matches found in the test string.
              </div>
            ) : (
              matchAnalysis.matches.map((m, idx) => (
                <div
                  key={idx}
                  onClick={() => navigator.clipboard.writeText(m.text)}
                  className="p-3 hover:bg-pink-50/50 transition rounded-xl flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono font-bold">
                        #{idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-pink-700 truncate">
                        {m.text}
                      </span>
                    </div>
                    {m.groups.length > 0 && (
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Groups: {m.groups.map((g, i) => `[${i + 1}]: "${g}"`).join(', ')}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    pos: {m.index}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
