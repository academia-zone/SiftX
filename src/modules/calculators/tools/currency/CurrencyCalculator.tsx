import React, { useState, useMemo } from 'react';
import { ArrowRightLeft, Copy, Check, Info } from 'lucide-react';

interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateAgainstUsd: number; // 1 USD = rate
  flag: string;
}

const CURRENCIES: Record<string, CurrencyRate> = {
  PKR: { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs.', rateAgainstUsd: 279.5, flag: '🇵🇰' },
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rateAgainstUsd: 1.0, flag: '🇺🇸' },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rateAgainstUsd: 0.92, flag: '🇪🇺' },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rateAgainstUsd: 0.78, flag: '🇬🇧' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED', rateAgainstUsd: 3.67, flag: '🇦🇪' },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR', rateAgainstUsd: 3.75, flag: '🇸🇦' },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rateAgainstUsd: 1.36, flag: '🇨🇦' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateAgainstUsd: 1.52, flag: '🇦🇺' },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rateAgainstUsd: 7.24, flag: '🇨🇳' },
  TRY: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', rateAgainstUsd: 32.5, flag: '🇹🇷' },
};

export const CurrencyCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number>(100);
  const [fromCode, setFromCode] = useState<string>('USD');
  const [toCode, setToCode] = useState<string>('PKR');
  const [copied, setCopied] = useState<boolean>(false);

  const swap = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  const convertedValue = useMemo(() => {
    const val = Number(amount) || 0;
    const fromRate = CURRENCIES[fromCode]?.rateAgainstUsd || 1;
    const toRate = CURRENCIES[toCode]?.rateAgainstUsd || 1;

    // Convert from source to USD then USD to target
    const inUsd = val / fromRate;
    const target = inUsd * toRate;
    return Number(target.toFixed(2));
  }, [amount, fromCode, toCode]);

  const oneUnitRate = useMemo(() => {
    const fromRate = CURRENCIES[fromCode]?.rateAgainstUsd || 1;
    const toRate = CURRENCIES[toCode]?.rateAgainstUsd || 1;
    return Number((toRate / fromRate).toFixed(4));
  }, [fromCode, toCode]);

  const handleCopy = () => {
    const text = `${amount} ${fromCode} = ${convertedValue} ${toCode}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Input (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Currency Pair & Amount
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Amount to Convert</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
          />
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400">From Currency:</span>
            <select
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={swap}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shadow-xs"
              title="Swap Currencies"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400">To Currency:</span>
            <select
              value={toCode}
              onChange={(e) => setToCode(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right Result Card (7 Cols) */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Converted Total</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1 font-mono">
              {CURRENCIES[toCode]?.symbol} {convertedValue.toLocaleString()}{' '}
              <span className="text-base font-bold text-emerald-700">{toCode}</span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all cursor-pointer shadow-xs"
            title="Copy Result"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-mono space-y-1">
          <span className="text-slate-400 font-sans block text-[11px] font-bold">Exchange Rate Benchmark:</span>
          <span className="text-slate-800 font-bold block">
            1 {fromCode} = {oneUnitRate} {toCode}
          </span>
        </div>

        {/* Quick Denomination Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Popular Multipliers
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            {[10, 50, 100, 500].map((mult) => (
              <div key={mult} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-slate-500 block text-[10px]">{mult} {fromCode}</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {Math.round(mult * oneUnitRate).toLocaleString()} {toCode}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Indicative Rate Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed text-slate-500">
            Exchange rates are indicative baseline pegs for currency estimation and budget planning. Commercial bank wire rates, open market cash exchangers, and credit card spreads may differ.
          </p>
        </div>
      </div>

    </div>
  );
};
