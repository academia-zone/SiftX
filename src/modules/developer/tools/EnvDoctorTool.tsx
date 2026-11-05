import React, { useState, useMemo } from 'react';
import { 
  FileCheck, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Copy, 
  Check, 
  RefreshCw, 
  FileText, 
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import { auditEnvFiles } from '../engines/developerEngine';

const SAMPLE_EXAMPLE_ENV = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgres://user:password@localhost:5432/mydb
REDIS_URL=redis://localhost:6379

# Third-party Services
STRIPE_SECRET_KEY=sk_test_placeholder
OPENAI_API_KEY=sk-placeholder
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=super_secret_jwt_key
`;

const SAMPLE_ACTUAL_ENV = `# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgres://admin:LiveProdSecret99!@db.production.internal:5432/main

# Third-party Services
STRIPE_SECRET_KEY=sk_live_51P88219xX00FakeRealKey
# Missing REDIS_URL
OPENAI_API_KEY=
JWT_SECRET=unquoted secret with whitespace 
EXTRA_DEBUG_FLAG=true
`;

export const EnvDoctorTool: React.FC = () => {
  const [exampleEnv, setExampleEnv] = useState<string>(SAMPLE_EXAMPLE_ENV);
  const [actualEnv, setActualEnv] = useState<string>(SAMPLE_ACTUAL_ENV);
  const [filter, setFilter] = useState<'all' | 'missing' | 'security_leak' | 'warning'>('all');
  const [copied, setCopied] = useState(false);

  const audit = useMemo(() => {
    return auditEnvFiles(exampleEnv, actualEnv);
  }, [exampleEnv, actualEnv]);

  const filteredItems = useMemo(() => {
    if (filter === 'missing') return audit.items.filter(i => i.status === 'missing');
    if (filter === 'security_leak') return audit.items.filter(i => i.status === 'security_leak');
    if (filter === 'warning') return audit.items.filter(i => i.status === 'syntax_warning' || i.status === 'duplicate');
    return audit.items;
  }, [audit, filter]);

  // Generate safe sanitized .env.example from active .env
  const handleGenerateCleanExample = () => {
    const lines = actualEnv.split('\n');
    const sanitized = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return line;
      const eq = line.indexOf('=');
      if (eq === -1) return line;
      const key = line.substring(0, eq).trim();
      return `${key}=your_${key.toLowerCase()}_here`;
    }).join('\n');

    setExampleEnv(sanitized);
  };

  const handleCopyCleanEnv = () => {
    navigator.clipboard.writeText(exampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">.env Doctor & Secret Leak Auditor</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Offline
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Prevent 2 AM deployment crashes. Catch missing variables, syntax errors, and accidental credential leaks.
            </p>
          </div>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Score</div>
            <div className={`text-lg font-black ${
              audit.healthScore > 80 ? 'text-emerald-600' : audit.healthScore > 50 ? 'text-amber-500' : 'text-rose-600'
            }`}>
              {audit.healthScore}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <button
            onClick={() => {
              setExampleEnv(SAMPLE_EXAMPLE_ENV);
              setActualEnv(SAMPLE_ACTUAL_ENV);
            }}
            className="p-2 rounded-xl hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title="Reset to sample"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilter('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filter === 'all' ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-[11px] font-bold opacity-75">Total Tracked</div>
          <div className="text-2xl font-black mt-1">{audit.items.length}</div>
        </div>

        <div 
          onClick={() => setFilter('missing')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filter === 'missing' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="text-[11px] font-bold flex items-center gap-1.5 text-rose-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Missing in .env</span>
          </div>
          <div className="text-2xl font-black mt-1 text-rose-600">{audit.missingCount}</div>
        </div>

        <div 
          onClick={() => setFilter('security_leak')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filter === 'security_leak' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="text-[11px] font-bold flex items-center gap-1.5 text-amber-500">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Security Leaks</span>
          </div>
          <div className="text-2xl font-black mt-1 text-amber-600">{audit.securityLeaksCount}</div>
        </div>

        <div 
          onClick={() => setFilter('warning')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            filter === 'warning' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="text-[11px] font-bold flex items-center gap-1.5 text-blue-500">
            <Info className="w-3.5 h-3.5" />
            <span>Syntax Warnings</span>
          </div>
          <div className="text-2xl font-black mt-1 text-blue-600">{audit.warningsCount}</div>
        </div>
      </div>

      {/* Main Split Comparison & Audit Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: .env.example & active .env inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* Example Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Reference Schema (.env.example)</span>
              </span>
              <button
                onClick={handleGenerateCleanExample}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-generate from active</span>
              </button>
            </div>
            <textarea
              value={exampleEnv}
              onChange={(e) => setExampleEnv(e.target.value)}
              placeholder="Paste .env.example content..."
              className="w-full h-48 p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Actual Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Active File (.env / .env.local)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Runs 100% in browser</span>
            </div>
            <textarea
              value={actualEnv}
              onChange={(e) => setActualEnv(e.target.value)}
              placeholder="Paste your real .env content..."
              className="w-full h-56 p-3 bg-slate-900 text-slate-100 font-mono text-xs rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Right Column: Diagnosis Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black text-slate-800">Diagnostic Inspection</h2>
              <span className="text-xs text-slate-400 font-medium">({filteredItems.length} items)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCleanEnv}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Clean .env.example</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-slate-100 p-2">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No items match the selected filter.
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                let badgeClass = 'bg-slate-100 text-slate-700';
                let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;

                if (item.status === 'missing') {
                  badgeClass = 'bg-rose-50 text-rose-700 border border-rose-200';
                  icon = <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
                } else if (item.status === 'security_leak') {
                  badgeClass = 'bg-amber-50 text-amber-800 border border-amber-200';
                  icon = <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />;
                } else if (item.status === 'syntax_warning' || item.status === 'duplicate') {
                  badgeClass = 'bg-blue-50 text-blue-700 border border-blue-200';
                  icon = <Info className="w-4 h-4 text-blue-500 shrink-0" />;
                }

                return (
                  <div key={idx} className="p-3 hover:bg-slate-50 transition rounded-xl flex items-start gap-3">
                    {icon}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-slate-800">{item.key}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badgeClass}`}>
                          {item.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        {item.message}
                      </p>
                      {item.exampleValue && (
                        <div className="mt-1 text-[10px] font-mono text-slate-400">
                          Example: <span className="text-slate-600">{item.exampleValue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
