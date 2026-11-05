import React, { useState } from 'react';
import { ArrowRight, Copy, Check } from 'lucide-react';
import { 
  calculatePercentageOf, 
  calculateWhatPercent, 
  calculatePercentageChange, 
  calculateAddSubtractPercentage 
} from '../../engines/percentageEngine';

export const PercentageCalculator: React.FC = () => {
  // Case 1: What is X% of Y?
  const [c1Percent, setC1Percent] = useState<number>(15);
  const [c1Total, setC1Total] = useState<number>(8500);

  // Case 2: X is what percent of Y?
  const [c2Part, setC2Part] = useState<number>(450);
  const [c2Total, setC2Total] = useState<number>(600);

  // Case 3: Percentage Change from X to Y
  const [c3Initial, setC3Initial] = useState<number>(2500);
  const [c3Final, setC3Final] = useState<number>(3200);

  // Case 4: Add / Subtract X% to Y
  const [c4Amount, setC4Amount] = useState<number>(12000);
  const [c4Percent, setC4Percent] = useState<number>(18);
  const [c4Op, setC4Op] = useState<'add' | 'sub'>('add');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyResult = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Pure Engine Calculations
  const r1 = calculatePercentageOf(c1Percent, c1Total);
  const r2 = calculateWhatPercent(c2Part, c2Total);
  const r3 = calculatePercentageChange(c3Initial, c3Final);
  const r4 = calculateAddSubtractPercentage(c4Amount, c4Percent, c4Op === 'add');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-sans">
      
      {/* CARD 1: What is X% of Y? */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900">What is X% of Y?</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
            Standard %
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Percentage (%)</span>
            <input
              type="number"
              value={c1Percent}
              onChange={(e) => setC1Percent(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <span className="text-slate-400 font-bold mt-5">% of</span>

          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Total Value (Y)</span>
            <input
              type="number"
              value={c1Total}
              onChange={(e) => setC1Total(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Result:</span>
            <span className="text-2xl font-black text-emerald-700 font-mono">{r1.value}</span>
          </div>
          <button
            onClick={() => copyResult('c1', r1.value.toString())}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-xs cursor-pointer transition-colors"
          >
            {copiedId === 'c1' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CARD 2: X is what % of Y? */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900">X is what % of Y?</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">
            Marks / Ratio
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Obtained / Part (X)</span>
            <input
              type="number"
              value={c2Part}
              onChange={(e) => setC2Part(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <span className="text-slate-400 font-bold mt-5">out of</span>

          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Total Whole (Y)</span>
            <input
              type="number"
              value={c2Total}
              onChange={(e) => setC2Total(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Result:</span>
            {r2.isUndefined ? (
              <span className="text-sm font-bold text-rose-500">Undefined (Total is 0)</span>
            ) : (
              <span className="text-2xl font-black text-emerald-700 font-mono">{r2.percentage}%</span>
            )}
          </div>
          <button
            onClick={() => copyResult('c2', `${r2.percentage}%`)}
            disabled={r2.isUndefined}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-xs cursor-pointer disabled:opacity-30"
          >
            {copiedId === 'c2' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CARD 3: Percentage Change from X to Y (CALC-BUG-003 Solved) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900">Percentage Change (X to Y)</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
            Growth / Drop
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Initial Value (X)</span>
            <input
              type="number"
              value={c3Initial}
              onChange={(e) => setC3Initial(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <div className="flex items-center justify-center mt-5 text-slate-400">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Final Value (Y)</span>
            <input
              type="number"
              value={c3Final}
              onChange={(e) => setC3Final(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Difference & Change:</span>
            {r3.isUndefined ? (
              <span className="text-sm font-bold text-rose-500">
                Undefined (Cannot compute % change from 0)
              </span>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-mono ${
                  r3.direction === 'increase' ? 'text-emerald-600' : r3.direction === 'decrease' ? 'text-rose-600' : 'text-slate-700'
                }`}>
                  {r3.direction === 'increase' ? '+' : ''}{r3.changePercent}%
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  ({r3.direction === 'increase' ? 'Increase' : r3.direction === 'decrease' ? 'Decrease' : 'No change'} of {r3.difference})
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => copyResult('c3', `${r3.changePercent}%`)}
            disabled={r3.isUndefined}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-xs cursor-pointer disabled:opacity-30"
          >
            {copiedId === 'c3' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CARD 4: Add / Subtract X% to Y */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900">Add or Subtract %</h3>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setC4Op('add')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                c4Op === 'add' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
              }`}
            >
              + Add
            </button>
            <button
              onClick={() => setC4Op('sub')}
              className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                c4Op === 'sub' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
              }`}
            >
              − Subtract
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Base Amount</span>
            <input
              type="number"
              value={c4Amount}
              onChange={(e) => setC4Amount(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <div className="flex-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-500">Percent (%)</span>
            <input
              type="number"
              value={c4Percent}
              onChange={(e) => setC4Percent(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Final Amount:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700 font-mono">{r4.result}</span>
              <span className="text-xs font-semibold text-slate-500">
                (Delta: {c4Op === 'add' ? '+' : '−'}{r4.delta})
              </span>
            </div>
          </div>
          <button
            onClick={() => copyResult('c4', r4.result.toString())}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-xs cursor-pointer"
          >
            {copiedId === 'c4' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

    </div>
  );
};
