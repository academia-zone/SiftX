import React, { useState, useMemo } from 'react';
// Lucide icons not needed

export const ProfitLossCalculator: React.FC = () => {
  const [costPrice, setCostPrice] = useState<number>(350);
  const [sellingPrice, setSellingPrice] = useState<number>(550);
  const [quantity, setQuantity] = useState<number>(100);

  const stats = useMemo(() => {
    const cp = Math.max(0, costPrice);
    const sp = Math.max(0, sellingPrice);
    const qty = Math.max(1, quantity);

    const totalCost = cp * qty;
    const totalRevenue = sp * qty;
    const netProfit = totalRevenue - totalCost;
    const isProfit = netProfit >= 0;

    const marginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const markupPercent = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

    return {
      totalCost,
      totalRevenue,
      netProfit,
      isProfit,
      marginPercent: Number(marginPercent.toFixed(1)),
      markupPercent: Number(markupPercent.toFixed(1)),
    };
  }, [costPrice, sellingPrice, quantity]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Input (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
          Trade & Production Costs
        </h3>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Cost Price per Unit</label>
          <input
            type="number"
            min="0"
            value={costPrice}
            onChange={(e) => setCostPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Selling Price per Unit</label>
          <input
            type="number"
            min="0"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Total Quantity Sold</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-[#0176fd]"
          />
        </div>
      </div>

      {/* Right Result Card (7 Cols) */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {stats.isProfit ? 'Total Gross Profit' : 'Total Loss'}
            </span>
            <h2 className={`text-3xl sm:text-4xl font-black tracking-tight mt-0.5 font-mono ${
              stats.isProfit ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              {stats.isProfit ? '+' : ''}Rs. {Math.abs(stats.netProfit).toLocaleString()}
            </h2>
          </div>
          <span className={`px-3.5 py-1.5 rounded-full font-bold text-xs border ${
            stats.isProfit ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {stats.marginPercent}% Profit Margin
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-0.5">Total Revenue:</span>
            <span className="font-mono font-bold text-slate-900 text-base">
              Rs. {stats.totalRevenue.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-0.5">Total Cost Investment:</span>
            <span className="font-mono font-bold text-slate-900 text-base">
              Rs. {stats.totalCost.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-0.5">Markup on Cost:</span>
            <span className="font-mono font-bold text-[#0176fd] text-base">
              {stats.markupPercent}%
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[11px] mb-0.5">Profit per Unit:</span>
            <span className="font-mono font-bold text-emerald-600 text-base">
              Rs. {(sellingPrice - costPrice).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
