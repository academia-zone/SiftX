import React, { useState, useMemo } from 'react';
// Lucide icons not needed

export const DiscountCalculator: React.FC = () => {
  const [originalPrice, setOriginalPrice] = useState<number>(4500);
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [extraDiscountPercent, setExtraDiscountPercent] = useState<number>(10);
  const [hasExtraDiscount, setHasExtraDiscount] = useState<boolean>(true);
  const [taxPercent, setTaxPercent] = useState<number>(0);

  const stats = useMemo(() => {
    const P = Math.max(0, originalPrice);
    const d1 = Math.max(0, Math.min(100, discountPercent));
    const d2 = hasExtraDiscount ? Math.max(0, Math.min(100, extraDiscountPercent)) : 0;
    const t = Math.max(0, taxPercent);

    // After primary discount
    const priceAfterD1 = P * (1 - d1 / 100);
    const d1Savings = P - priceAfterD1;

    // After extra discount
    const priceAfterD2 = priceAfterD1 * (1 - d2 / 100);
    const d2Savings = priceAfterD1 - priceAfterD2;

    const totalSavings = d1Savings + d2Savings;
    const taxAmount = priceAfterD2 * (t / 100);
    const finalPrice = priceAfterD2 + taxAmount;

    const effectiveDiscountPercent = P > 0 ? (totalSavings / P) * 100 : 0;

    return {
      priceAfterD1: Math.round(priceAfterD1),
      priceAfterD2: Math.round(priceAfterD2),
      totalSavings: Math.round(totalSavings),
      taxAmount: Math.round(taxAmount),
      finalPrice: Math.round(finalPrice),
      effectiveDiscountPercent: Number(effectiveDiscountPercent.toFixed(1)),
    };
  }, [originalPrice, discountPercent, extraDiscountPercent, hasExtraDiscount, taxPercent]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Input (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Price & Discount Rules
        </h3>

        {/* Original Price */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Original Price (Tag Price)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">Rs.</span>
            <input
              type="number"
              min="0"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full p-2.5 pl-10 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
            />
          </div>
        </div>

        {/* Primary Discount % */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-700">Primary Sale Discount</span>
            <span className="text-[#0176fd] font-mono">{discountPercent}% OFF</span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            step="5"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
            className="w-full accent-[#0176fd] cursor-pointer h-1.5"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            {[10, 20, 25, 30, 40, 50, 70].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDiscountPercent(preset)}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  discountPercent === preset ? 'bg-slate-900 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {preset}%
              </button>
            ))}
          </div>
        </div>

        {/* Extra Coupon Discount Toggle */}
        <div className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800">Extra Coupon Discount</span>
              <p className="text-[11px] text-slate-500">e.g. Extra 10% promo code on sale price</p>
            </div>
            <input
              type="checkbox"
              checked={hasExtraDiscount}
              onChange={(e) => setHasExtraDiscount(e.target.checked)}
              className="w-4 h-4 accent-[#0176fd] cursor-pointer"
            />
          </div>

          {hasExtraDiscount && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-600">Promo Code %</span>
                <span className="text-emerald-600 font-mono">+{extraDiscountPercent}% EXTRA</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={extraDiscountPercent}
                onChange={(e) => setExtraDiscountPercent(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-1.5"
              />
            </div>
          )}
        </div>

        {/* Optional Sales Tax */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Sales Tax / VAT (Optional %)</label>
          <input
            type="number"
            min="0"
            max="30"
            value={taxPercent}
            onChange={(e) => setTaxPercent(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono outline-none focus:border-[#0176fd]"
            placeholder="0%"
          />
        </div>

      </div>

      {/* Right Result Card (7 Cols) */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Payable Price</span>
            <h2 className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight mt-0.5 font-mono">
              Rs. {stats.finalPrice.toLocaleString()}
            </h2>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
            {stats.effectiveDiscountPercent}% Total Savings
          </span>
        </div>

        {/* Breakdown Stats */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">You Save in Cash:</span>
            <span className="text-xl font-black text-emerald-600 font-mono">
              Rs. {stats.totalSavings.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50">
              <span className="text-slate-400 block text-[11px]">Original Tag Price:</span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-0.5 line-through">
                Rs. {originalPrice.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50">
              <span className="text-slate-400 block text-[11px]">Tax Added:</span>
              <span className="font-mono font-bold text-slate-800 text-sm mt-0.5">
                Rs. {stats.taxAmount.toLocaleString()} ({taxPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
