import React, { useState, useMemo, useRef } from 'react';
import { Zap, CheckCircle2, RotateCcw, Download, Printer } from 'lucide-react';
import { downloadSvgAsPng, printElementAsPdf } from '../../shared/cardExporter';

export const ElectricityBillCalculator: React.FC = () => {
  const [units, setUnits] = useState<number>(240);
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [disco, setDisco] = useState<string>('LESCO');
  const [includeFpa, setIncludeFpa] = useState<boolean>(true);
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const cardSvgRef = useRef<SVGSVGElement>(null);

  const handleDownloadImage = async () => {
    if (!cardSvgRef.current) return;
    try {
      setIsExporting(true);
      await downloadSvgAsPng(cardSvgRef.current, `electricity_bill_${disco}_${units}units_siftx.png`, 2);
    } catch (err) {
      console.error(err);
      alert('Failed to generate Bill PNG image');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    printElementAsPdf('electricity-bill-printable-area', `Electricity Bill Estimate - ${disco} - ${units} Units`);
  };

  // Calculation Breakdown
  const calculation = useMemo(() => {
    const u = Math.max(0, Number(units) || 0);

    let energyCharges = 0;
    const slabBreakdown: { slab: string; units: number; rate: number; amount: number }[] = [];

    if (isProtected && u <= 200) {
      // Protected Slabs
      let rem = u;
      if (rem > 0) {
        const s1 = Math.min(rem, 50);
        const amt = s1 * 7.74;
        energyCharges += amt;
        slabBreakdown.push({ slab: '1 - 50 units (Protected)', units: s1, rate: 7.74, amount: amt });
        rem -= s1;
      }
      if (rem > 0) {
        const s2 = Math.min(rem, 50);
        const amt = s2 * 10.06;
        energyCharges += amt;
        slabBreakdown.push({ slab: '51 - 100 units (Protected)', units: s2, rate: 10.06, amount: amt });
        rem -= s2;
      }
      if (rem > 0) {
        const s3 = rem;
        const amt = s3 * 14.26;
        energyCharges += amt;
        slabBreakdown.push({ slab: '101 - 200 units (Protected)', units: s3, rate: 14.26, amount: amt });
      }
    } else {
      // Unprotected / Standard Slabs
      if (u <= 100) {
        const amt = u * 23.59;
        energyCharges = amt;
        slabBreakdown.push({ slab: '1 - 100 units', units: u, rate: 23.59, amount: amt });
      } else if (u <= 200) {
        const amt = u * 30.07;
        energyCharges = amt;
        slabBreakdown.push({ slab: '101 - 200 units', units: u, rate: 30.07, amount: amt });
      } else if (u <= 300) {
        const amt = u * 34.26;
        energyCharges = amt;
        slabBreakdown.push({ slab: '201 - 300 units', units: u, rate: 34.26, amount: amt });
      } else if (u <= 400) {
        const amt = u * 39.15;
        energyCharges = amt;
        slabBreakdown.push({ slab: '301 - 400 units', units: u, rate: 39.15, amount: amt });
      } else if (u <= 500) {
        const amt = u * 41.36;
        energyCharges = amt;
        slabBreakdown.push({ slab: '401 - 500 units', units: u, rate: 41.36, amount: amt });
      } else if (u <= 600) {
        const amt = u * 42.78;
        energyCharges = amt;
        slabBreakdown.push({ slab: '501 - 600 units', units: u, rate: 42.78, amount: amt });
      } else if (u <= 700) {
        const amt = u * 43.92;
        energyCharges = amt;
        slabBreakdown.push({ slab: '601 - 700 units', units: u, rate: 43.92, amount: amt });
      } else {
        const amt = u * 48.84;
        energyCharges = amt;
        slabBreakdown.push({ slab: 'Above 700 units', units: u, rate: 48.84, amount: amt });
      }
    }

    // Taxes & Surcharges
    const fcSurcharge = u * 3.23; // Financing Cost Surcharge Rs. 3.23/unit
    const electricityDuty = energyCharges * 0.015; // 1.5%
    const fpaAmount = includeFpa ? u * 2.85 : 0; // Estimated Fuel Price Adjustment ~Rs. 2.85/unit
    const tvFee = u > 0 ? 35 : 0; // Fixed PTV fee

    const subTotalBeforeGst = energyCharges + fcSurcharge + electricityDuty + fpaAmount + tvFee;
    const gstAmount = (includeGst && (u > 200 || !isProtected)) ? (energyCharges + fcSurcharge + fpaAmount) * 0.18 : 0;

    const totalBill = Math.round(subTotalBeforeGst + gstAmount);

    return {
      units: u,
      energyCharges: Math.round(energyCharges),
      fcSurcharge: Math.round(fcSurcharge),
      electricityDuty: Math.round(electricityDuty),
      fpaAmount: Math.round(fpaAmount),
      tvFee,
      gstAmount: Math.round(gstAmount),
      totalBill,
      slabBreakdown,
    };
  }, [units, isProtected, includeFpa, includeGst]);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 text-xs flex items-start gap-3 shadow-xs">
        <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-extrabold text-sm text-emerald-900">Estimated Tariff Model • NEPRA Domestic Schedule</p>
          <p className="mt-0.5 leading-relaxed text-emerald-800">
            Calculates estimated domestic residential electricity bills including base energy slabs, F.C. surcharges, Electricity Duty, PTV fee, and 18% General Sales Tax. Actual monthly DISCO bills (LESCO, K-Electric, IESCO, FESCO, GEPCO) vary depending on monthly Fuel Cost Adjustments (FCA) and municipal charges.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Input Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Bill Parameters
            </h3>
            <button
              onClick={() => {
                setUnits(240);
                setIsProtected(false);
                setIncludeFpa(true);
                setIncludeGst(true);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Consumed Units Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex justify-between">
              <span>Consumed Electricity Units (kWh)</span>
              <span className="text-[#0176fd] font-mono text-sm">{units} Units</span>
            </label>
            <input
              type="number"
              min="0"
              max="5000"
              value={units}
              onChange={(e) => setUnits(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-[#0176fd] focus:ring-2 focus:ring-[#0176fd]/20 text-base font-bold font-mono text-slate-900 outline-none"
            />
            {/* Quick Unit Presets */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {[50, 100, 180, 200, 300, 450, 750].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setUnits(preset)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    units === preset
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Electricity Provider DISCO */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Distribution Company (DISCO)</label>
            <select
              value={disco}
              onChange={(e) => setDisco(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 outline-none focus:border-[#0176fd]"
            >
              <option value="LESCO">LESCO — Lahore Electric Supply Company</option>
              <option value="IESCO">IESCO — Islamabad Electric Supply Company</option>
              <option value="KE">K-Electric — Karachi</option>
              <option value="FESCO">FESCO — Faisalabad Electric Supply Company</option>
              <option value="GEPCO">GEPCO — Gujranwala Electric Power Company</option>
              <option value="MEPCO">MEPCO — Multan Electric Power Company</option>
              <option value="PESCO">PESCO — Peshawar Electric Supply Company</option>
              <option value="HESCO">HESCO — Hyderabad Electric Supply Company</option>
              <option value="QESCO">QESCO — Quetta Electric Supply Company</option>
            </select>
          </div>

          {/* Protected Consumer Status Toggle */}
          <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-slate-900">Protected Consumer</span>
                <p className="text-[11px] text-slate-500 leading-tight">Consistently under 200 units for last 6 months</p>
              </div>
              <input
                type="checkbox"
                checked={isProtected}
                onChange={(e) => setIsProtected(e.target.checked)}
                className="w-4 h-4 accent-[#0176fd] cursor-pointer"
              />
            </div>
            {isProtected && units > 200 && (
              <p className="text-[11px] text-amber-700 bg-amber-100/70 p-2 rounded-lg font-medium">
                Note: Consuming over 200 units automatically shifts billing to the unprotected tariff.
              </p>
            )}
          </div>

          {/* Extra Checkboxes */}
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeFpa}
                onChange={(e) => setIncludeFpa(e.target.checked)}
                className="w-4 h-4 accent-[#0176fd] cursor-pointer"
              />
              <span>Include Fuel Price Adjustment (FPA ~Rs. 2.85/unit)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={includeGst}
                onChange={(e) => setIncludeGst(e.target.checked)}
                className="w-4 h-4 accent-[#0176fd] cursor-pointer"
              />
              <span>Include 18% General Sales Tax (GST)</span>
            </label>
          </div>

          {/* Export Actions Bar */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Save & Export Utility Estimate
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDownloadImage}
                disabled={isExporting}
                className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Generating...' : 'Download PNG'}</span>
              </button>

              <button
                onClick={handlePrintPdf}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Bill Summary Card (7 Cols) */}
        <div id="electricity-bill-printable-area" className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Monthly Bill</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#020f22] tracking-tight mt-0.5">
                Rs. {calculation.totalBill.toLocaleString()}
              </h2>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
              {disco} Residential
            </span>
          </div>

          {/* Visual Slab Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tariff Slab Breakdown
            </h4>
            <div className="space-y-2">
              {calculation.slabBreakdown.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900">{s.slab}</span>
                    <span className="text-slate-400 ml-2">({s.units} units × Rs. {s.rate})</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800">Rs. {Math.round(s.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Taxes and Surcharges */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Surcharges & Government Levies
            </h4>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">Base Energy Cost:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">Rs. {calculation.energyCharges.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">F.C. Surcharge (Rs. 3.23/u):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">Rs. {calculation.fcSurcharge.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">FPA Adjustment:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">Rs. {calculation.fpaAmount.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">Electricity Duty (1.5%):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">Rs. {calculation.electricityDuty.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">PTV License Fee:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">Rs. {calculation.tvFee}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-500 block">18% GST Amount:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">Rs. {calculation.gstAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Conservation Advice */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Tip:</strong> Keeping monthly consumption below 200 units qualifies you for protected tariff status, reducing the average base unit cost by over 50%.
            </p>
          </div>

          {/* Hidden SVG for Bill Slip PNG Export */}
          <div className="hidden">
            <svg
              ref={cardSvgRef}
              width="640"
              height="440"
              viewBox="0 0 640 440"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="640" height="440" rx="32" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
              <text x="40" y="50" fill="#059669" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                SIFTX • ELECTRICITY BILL ESTIMATE VOUCHER ({disco})
              </text>
              <text x="40" y="115" fill="#0f172a" fontSize="36" fontWeight="900" fontFamily="sans-serif">
                Rs. {calculation.totalBill.toLocaleString()} <tspan fontSize="16" fill="#64748b" fontWeight="normal">/ {units} Units ({isProtected ? 'Protected' : 'Unprotected'})</tspan>
              </text>
              <line x1="40" y1="140" x2="600" y2="140" stroke="#e2e8f0" strokeWidth="1" />
              {/* Table rows */}
              <text x="40" y="180" fill="#64748b" fontSize="13" fontFamily="sans-serif">Base Energy Charges</text>
              <text x="440" y="180" fill="#0f172a" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Rs. {calculation.energyCharges.toLocaleString()}</text>
              <text x="40" y="215" fill="#64748b" fontSize="13" fontFamily="sans-serif">Financing Cost Surcharge (F.C.)</text>
              <text x="440" y="215" fill="#0f172a" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Rs. {calculation.fcSurcharge.toLocaleString()}</text>
              <text x="40" y="250" fill="#64748b" fontSize="13" fontFamily="sans-serif">Fuel Price Adjustment (FPA)</text>
              <text x="440" y="250" fill="#0f172a" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Rs. {calculation.fpaAmount.toLocaleString()}</text>
              <text x="40" y="285" fill="#64748b" fontSize="13" fontFamily="sans-serif">Govt Taxes & Levies (Duty, PTV, GST)</text>
              <text x="440" y="285" fill="#0f172a" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Rs. {(calculation.electricityDuty + calculation.tvFee + calculation.gstAmount).toLocaleString()}</text>
              <line x1="40" y1="315" x2="600" y2="315" stroke="#10b981" strokeWidth="1.5" />
              <text x="40" y="350" fill="#059669" fontSize="16" fontWeight="bold" fontFamily="sans-serif">TOTAL ESTIMATED PAYABLE</text>
              <text x="440" y="350" fill="#059669" fontSize="20" fontWeight="900" fontFamily="sans-serif">Rs. {calculation.totalBill.toLocaleString()}</text>
              <text x="40" y="405" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
                NEPRA Schedule Benchmark • 100% Client-Side Privacy
              </text>
              <text x="530" y="405" fill="#059669" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                siftx.app
              </text>
            </svg>
          </div>

        </div>

      </div>
    </div>
  );
};
