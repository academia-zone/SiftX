import React, { useState, useEffect, useRef } from 'react';
import { Delete, Clock, Equal, Copy, Check, RotateCcw } from 'lucide-react';
import { evaluateExpression } from '../../engines/mathParser';

export const ScientificCalculator: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  // Default to Degree Mode ('deg') like Google Calculator
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const isDegree = angleMode === 'deg';

  const handleDigit = (d: string) => {
    setErrorText(null);
    if (display === '0' || display === 'Error') {
      setDisplay(d);
    } else {
      setDisplay(display + d);
    }
  };

  const handleDot = () => {
    setErrorText(null);
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op: string) => {
    setErrorText(null);
    setExpression((prev) => (prev ? `${prev} ${display} ${op}` : `${display} ${op}`));
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setErrorText(null);
  };

  const handleBackspace = () => {
    setErrorText(null);
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleScientificFunction = (fn: string) => {
    setErrorText(null);
    const val = parseFloat(display);
    if (isNaN(val)) return;

    if (fn === 'pi') {
      setDisplay(Number(Math.PI.toFixed(8)).toString());
      return;
    }
    if (fn === 'e') {
      setDisplay(Number(Math.E.toFixed(8)).toString());
      return;
    }

    const res = evaluateExpression(`${fn}(${val})`, isDegree);
    if (res.error) {
      setErrorText(res.error);
    } else {
      const resStr = res.value.toString();
      setDisplay(resStr);
      setHistory((prev) => [{ expr: `${fn}(${val}${isDegree ? '°' : ' rad'})`, result: resStr }, ...prev.slice(0, 9)]);
    }
  };

  const handleEqual = () => {
    setErrorText(null);
    const full = (expression ? `${expression} ${display}` : display).trim();
    if (!full) return;

    const res = evaluateExpression(full, isDegree);

    if (res.error) {
      setErrorText(res.error);
      setDisplay('Error');
    } else {
      const resStr = res.value.toString();
      setDisplay(resStr);
      setHistory((prev) => [{ expr: full, result: resStr }, ...prev.slice(0, 9)]);
      setExpression('');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing when user is typing in inputs elsewhere
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDot();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        e.preventDefault();
        handleOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, expression, isDegree]);

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Calculator Body */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* Screen Display */}
        <div className="bg-slate-900 rounded-2xl p-5 text-right font-mono text-white space-y-1 shadow-inner relative overflow-hidden">
          
          <div className="flex items-center justify-between text-xs text-slate-400">
            {/* Prominent Active Mode Indicator */}
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wide ${
                isDegree
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}>
                {isDegree ? 'DEG (Degrees)' : 'RAD (Radians)'}
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                {isDegree ? 'tan(1°) = 0.017455' : 'tan(1 rad) = 1.557407'}
              </span>
            </div>

            <div className="h-4 truncate max-w-[280px]">
              {expression || '\u00A0'}
            </div>
          </div>

          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight truncate py-1">
            {display}
          </div>

          {errorText && (
            <div className="text-xs text-rose-400 font-sans font-medium text-left pt-1 flex items-center gap-1.5">
              <span>⚠️ {errorText}</span>
            </div>
          )}

          {/* Quick Copy Action */}
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 cursor-pointer"
            title="Copy Result"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Top Control Bar with Google-style DEG | RAD Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Google-Style Deg / Rad Segmented Switch */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setAngleMode('deg')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                isDegree
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Deg
            </button>
            <button
              type="button"
              onClick={() => setAngleMode('rad')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                !isDegree
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rad
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Physical keyboard: numbers, operators, Enter (=), Backspace
            </span>

            <button
              onClick={handleClear}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-2.5">
          
          {/* Scientific Functions */}
          {[
            { label: 'sin', fn: () => handleScientificFunction('sin') },
            { label: 'cos', fn: () => handleScientificFunction('cos') },
            { label: 'tan', fn: () => handleScientificFunction('tan') },
            { label: 'ln', fn: () => handleScientificFunction('ln') },
            { label: 'log', fn: () => handleScientificFunction('log') },
            { label: 'sqrt', fn: () => handleScientificFunction('sqrt') },
            { label: 'π', fn: () => handleScientificFunction('pi') },
            { label: 'e', fn: () => handleScientificFunction('e') },
            { label: '^', fn: () => handleOperator('^') },
            { label: '%', fn: () => handleOperator('%') },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.fn}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer hover:scale-102"
            >
              {btn.label}
            </button>
          ))}

          {/* Clear & Backspace */}
          <button
            onClick={handleClear}
            className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs sm:text-sm font-black transition-all cursor-pointer"
          >
            AC
          </button>
          <button
            onClick={handleBackspace}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer"
          >
            <Delete className="w-4 h-4" />
          </button>

          {/* Standard Keypad */}
          {[
            { val: '7', type: 'num' },
            { val: '8', type: 'num' },
            { val: '9', type: 'num' },
            { val: '/', type: 'op', label: '÷' },
            { val: '4', type: 'num' },
            { val: '5', type: 'num' },
            { val: '6', type: 'num' },
            { val: '*', type: 'op', label: '×' },
            { val: '1', type: 'num' },
            { val: '2', type: 'num' },
            { val: '3', type: 'num' },
            { val: '-', type: 'op', label: '−' },
            { val: '0', type: 'num' },
            { val: '.', type: 'dot', label: '.' },
            { val: '+', type: 'op', label: '+' },
          ].map((k) => {
            if (k.type === 'num') {
              return (
                <button
                  key={k.val}
                  onClick={() => handleDigit(k.val)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-slate-300 text-slate-900 text-base sm:text-lg font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer hover:scale-102"
                >
                  {k.val}
                </button>
              );
            }
            if (k.type === 'dot') {
              return (
                <button
                  key={k.val}
                  onClick={handleDot}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 text-slate-900 text-base sm:text-lg font-bold shadow-xs transition-all cursor-pointer"
                >
                  .
                </button>
              );
            }
            return (
              <button
                key={k.val}
                onClick={() => handleOperator(k.val)}
                className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-base sm:text-lg font-black transition-all cursor-pointer"
              >
                {k.label || k.val}
              </button>
            );
          })}

          {/* Equal Button */}
          <button
            onClick={handleEqual}
            className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-base sm:text-lg font-black shadow-md shadow-emerald-600/30 flex items-center justify-center transition-all cursor-pointer hover:scale-102"
          >
            <Equal className="w-5 h-5" />
          </button>

        </div>

      </div>

      {/* History Ribbon */}
      {history.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Calculation History</span>
            </span>
            <button
              onClick={() => setHistory([])}
              className="text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setDisplay(item.result)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 hover:border-emerald-200 flex items-center justify-between text-xs font-mono cursor-pointer transition-all group"
              >
                <span className="text-slate-500">{item.expr} =</span>
                <span className="font-extrabold text-slate-900 group-hover:text-emerald-700">
                  {item.result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
