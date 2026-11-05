import React, { useState, useMemo } from 'react';
// Lucide icons not needed

export const GstCalculator: React.FC = () => {
  const [amount, setAmount] = useState<number>(25000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [taxMode, setTaxMode] = useState<'exclusive' | 'inclusive'>('exclusive');
  

  const stats = useMemo(() => {
    const P = Math.max(0, amount);
    const r = Math.max(0, gstRate) / 100;

    let netAmount = 0;
    let gstAmount = 0;
    let grossTotal = 0;

    if (taxMode === 'exclusive') {
      // Adding GST
      netAmount = P;
      gstAmount = P * r;
      grossTotal = P + gstAmount;
    } else {
      // Extracting GST from inclusive amount
      grossTotal = P;
      netAmount = P / (1 + r);
      gstAmount = P - netAmount;
    }

    return {
      netAmount: Math.round(netAmount),
      gstAmount: Math.round(gstAmount),
      grossTotal: Math.round(grossTotal),
    };
  }, [amount, gstRate, taxMode]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Input (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Tax Computation Setup
        </h3>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            onClick={() => setTaxMode('exclusive')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              taxMode === 'exclusive' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Add GST (Exclusive)
          </button>
          <button
            onClick={() => setTaxMode('inclusive')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              taxMode === 'inclusive' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
            }`}
          >
            Remove GST (Inclusive)
          </button>
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            {taxMode === 'exclusive' ? 'Net Base Amount' : 'Gross Total Amount (Inc. Tax)'}
          </label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
          />
        </div>

        {/* GST Rate Presets */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-700">GST Sales Tax Rate (%)</span>
            <span className="text-[#0176fd] font-mono">{gstRate}%</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[18, 17, 15, 5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setGstRate(rate)}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  gstRate === rate
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Result Card (7 Cols) */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {taxMode === 'exclusive' ? 'Final Total With GST' : 'Extracted Pre-Tax Net Amount'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5 font-mono">
              Rs. {(taxMode === 'exclusive' ? stats.grossTotal : stats.netAmount).toLocaleString()}
            </h2>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-[#0176fd] font-bold text-xs border border-blue-200">
            {gstRate}% Sales Tax
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-0.5">Net Pre-Tax:</span>
            <span className="font-mono font-bold text-slate-900 text-base">
              Rs. {stats.netAmount.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <span className="text-amber-700 block text-[11px] mb-0.5">GST Tax ({gstRate}%):</span>
            <span className="font-mono font-bold text-amber-900 text-base">
              Rs. {stats.gstAmount.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-emerald-700 block text-[11px] mb-0.5">Total Gross:</span>
            <span className="font-mono font-bold text-emerald-900 text-base">
              Rs. {stats.grossTotal.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
