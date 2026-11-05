import React, { useState, useMemo, useRef } from 'react';
import { 
  Download, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import { downloadSvgAsPng, printElementAsPdf } from '../../shared/cardExporter';

export const BmiCalculator: React.FC = () => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  
  // Metric
  const [weightKg, setWeightKg] = useState<number>(72);
  const [heightCm, setHeightCm] = useState<number>(175);

  // Imperial
  const [weightLbs, setWeightLbs] = useState<number>(158);
  const [heightFt, setHeightFt] = useState<number>(5);
  const [heightIn, setHeightIn] = useState<number>(9);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const cardSvgRef = useRef<SVGSVGElement>(null);

  const stats = useMemo(() => {
    let w = weightKg;
    let hM = heightCm / 100;

    if (unitSystem === 'imperial') {
      w = weightLbs * 0.453592;
      const totalInches = heightFt * 12 + heightIn;
      hM = totalInches * 0.0254;
    }

    if (hM <= 0 || w <= 0) return null;

    const bmi = w / (hM * hM);
    const minHealthyKg = 18.5 * (hM * hM);
    const maxHealthyKg = 24.9 * (hM * hM);

    let category = 'Normal';
    let color = 'text-emerald-700';
    let bg = 'bg-emerald-50 border-emerald-200';
    let hexColor = '#059669';
    let percentage = 50;
    let advice = 'Your weight is in the optimal healthy range for your height. Maintain your current active routine and balanced nutrition.';

    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-amber-700';
      bg = 'bg-amber-50 border-amber-200';
      hexColor = '#d97706';
      percentage = Math.max(5, Math.min(25, (bmi / 18.5) * 25));
      advice = 'Your BMI indicates you may be underweight. Focus on nutrient-dense foods, healthy fats, and strength training to build lean muscle.';
    } else if (bmi <= 24.9) {
      category = 'Healthy / Normal Weight';
      color = 'text-emerald-700';
      bg = 'bg-emerald-50 border-emerald-200';
      hexColor = '#059669';
      percentage = 25 + ((bmi - 18.5) / (24.9 - 18.5)) * 25;
      advice = 'Excellent! Your body mass index is within the WHO healthy range. Keep up regular aerobic activity and whole-food nutrition.';
    } else if (bmi <= 29.9) {
      category = 'Overweight';
      color = 'text-orange-700';
      bg = 'bg-orange-50 border-orange-200';
      hexColor = '#ea580c';
      percentage = 50 + ((bmi - 25) / (29.9 - 25)) * 25;
      advice = 'Slightly above recommended weight. Incorporating 30 minutes of daily brisk walking and reducing refined carbohydrates can help bring you into the normal range.';
    } else {
      category = 'Obesity Class';
      color = 'text-rose-700';
      bg = 'bg-rose-50 border-rose-200';
      hexColor = '#e11d48';
      percentage = Math.min(95, 75 + ((bmi - 30) / 10) * 25);
      advice = 'Your BMI is in the obesity category, which carries elevated cardiovascular risks. Consult a certified nutritionist or physician for a safe, structured plan.';
    }

    return {
      bmi: Number(bmi.toFixed(1)),
      category,
      color,
      bg,
      hexColor,
      percentage: Math.min(100, Math.max(0, percentage)),
      idealWeightKg: `${minHealthyKg.toFixed(1)} - ${maxHealthyKg.toFixed(1)} kg`,
      idealWeightLbs: `${(minHealthyKg * 2.20462).toFixed(1)} - ${(maxHealthyKg * 2.20462).toFixed(1)} lbs`,
      advice,
    };
  }, [unitSystem, weightKg, heightCm, weightLbs, heightFt, heightIn]);

  const handleReset = () => {
    if (unitSystem === 'metric') {
      setWeightKg(72);
      setHeightCm(175);
    } else {
      setWeightLbs(158);
      setHeightFt(5);
      setHeightIn(9);
    }
  };

  const handleDownloadImage = async () => {
    if (!cardSvgRef.current) return;
    try {
      setIsExporting(true);
      await downloadSvgAsPng(cardSvgRef.current, `bmi_health_report_siftx.png`, 2);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PNG image');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    printElementAsPdf('bmi-report-printable-area', 'SiftX Health & BMI Report');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* Left Input (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900">Physical Metrics</h3>
          
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setUnitSystem('metric')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                unitSystem === 'metric' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Metric (kg/cm)
            </button>
            <button
              onClick={() => setUnitSystem('imperial')}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                unitSystem === 'imperial' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Imperial (lbs/ft)
            </button>
          </div>
        </div>

        {unitSystem === 'metric' ? (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Height (cm)</span>
                <span className="font-mono text-emerald-700 font-bold">{heightCm} cm</span>
              </label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Math.max(50, parseFloat(e.target.value) || 0))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex justify-between">
                <span>Weight (kg)</span>
                <span className="font-mono text-emerald-700 font-bold">{weightKg} kg</span>
              </label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Math.max(20, parseFloat(e.target.value) || 0))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Height (Feet & Inches)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Feet"
                  value={heightFt}
                  onChange={(e) => setHeightFt(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-1/2 p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
                <input
                  type="number"
                  placeholder="Inches"
                  value={heightIn}
                  onChange={(e) => setHeightIn(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-1/2 p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Weight (Pounds)</label>
              <input
                type="number"
                value={weightLbs}
                onChange={(e) => setWeightLbs(Math.max(30, parseFloat(e.target.value) || 0))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </>
        )}

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Standard</span>
          </button>
        </div>

        {/* Export Buttons */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Save & Export Health Card
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadImage}
              disabled={isExporting || !stats}
              className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating...' : 'Download PNG'}</span>
            </button>

            <button
              onClick={handlePrintPdf}
              disabled={!stats}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-40"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Result Card (7 Cols) */}
      <div id="bmi-report-printable-area" className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        {stats && (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Body Mass Index</span>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mt-0.5 font-mono">
                  {stats.bmi} <span className="text-base font-normal text-slate-400">kg/m²</span>
                </h2>
              </div>
              <span className={`px-4 py-2 rounded-2xl font-black text-xs border ${stats.bg} ${stats.color} shadow-xs`}>
                {stats.category}
              </span>
            </div>

            {/* Visual Color Scale Gauge Bar with Needle */}
            <div className="space-y-2.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-400">
                <span>Underweight (&lt;18.5)</span>
                <span>Normal (18.5 - 24.9)</span>
                <span>Overweight (25 - 29.9)</span>
                <span>Obese (&gt;30)</span>
              </div>

              <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner bg-gradient-to-r from-amber-400 via-emerald-500 via-orange-400 to-rose-500 relative">
                {/* Pointer Needle */}
                <div
                  style={{ left: `${stats.percentage}%` }}
                  className="absolute top-0 bottom-0 w-2.5 bg-slate-950 rounded-full border-2 border-white shadow-lg transform -translate-x-1.5 transition-all duration-300"
                />
              </div>
            </div>

            {/* Ideal Target Weight Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-700 font-bold">Recommended Ideal Target Weight:</span>
              </div>
              <span className="font-mono font-black text-emerald-800 text-sm">
                {unitSystem === 'metric' ? stats.idealWeightKg : stats.idealWeightLbs}
              </span>
            </div>

            {/* Personalized Guidance Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Personalized Wellness Guidance</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                {stats.advice}
              </p>
            </div>

            {/* Hidden High-Resolution SVG for Image Export */}
            <div className="hidden">
              <svg
                ref={cardSvgRef}
                width="640"
                height="400"
                viewBox="0 0 640 400"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="bmiGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f0fdf4" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                  <linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="35%" stopColor="#10b981" />
                    <stop offset="70%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>

                <rect width="640" height="400" rx="32" fill="url(#bmiGrad)" stroke="#10b981" strokeWidth="2" />

                <text x="40" y="50" fill="#059669" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                  SIFTX • BODY MASS INDEX & HEALTH REPORT
                </text>

                {/* Score */}
                <text x="40" y="120" fill="#0f172a" fontSize="42" fontWeight="900" fontFamily="sans-serif">
                  {stats.bmi} <tspan fontSize="20" fill="#64748b" fontWeight="normal">kg/m²</tspan>
                </text>

                <rect x="230" y="85" width="220" height="40" rx="20" fill="#ffffff" stroke={stats.hexColor} strokeWidth="2" />
                <text x="250" y="110" fill={stats.hexColor} fontSize="14" fontWeight="bold" fontFamily="sans-serif">
                  {stats.category}
                </text>

                {/* Spectrum Bar */}
                <rect x="40" y="160" width="560" height="16" rx="8" fill="url(#spectrum)" />
                {/* Pointer */}
                <circle cx={40 + (560 * stats.percentage) / 100} cy="168" r="10" fill="#0f172a" stroke="#ffffff" strokeWidth="3" />

                <text x="40" y="200" fill="#64748b" fontSize="11" fontFamily="sans-serif">Underweight (&lt;18.5)</text>
                <text x="210" y="200" fill="#64748b" fontSize="11" fontFamily="sans-serif">Normal (18.5 - 24.9)</text>
                <text x="390" y="200" fill="#64748b" fontSize="11" fontFamily="sans-serif">Overweight (25 - 29.9)</text>
                <text x="540" y="200" fill="#64748b" fontSize="11" fontFamily="sans-serif">Obese (&gt;30)</text>

                {/* Ideal Weight Box */}
                <rect x="40" y="235" width="560" height="65" rx="16" fill="#ffffff" stroke="#e2e8f0" />
                <text x="60" y="265" fill="#64748b" fontSize="12" fontFamily="sans-serif">TARGET HEALTHY WEIGHT RANGE</text>
                <text x="60" y="287" fill="#059669" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                  {unitSystem === 'metric' ? stats.idealWeightKg : stats.idealWeightLbs}
                </text>

                {/* Footer */}
                <text x="40" y="360" fill="#64748b" fontSize="12" fontFamily="sans-serif">
                  Based on World Health Organization (WHO) Standards • Private Client Processing
                </text>
                <text x="520" y="360" fill="#059669" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  siftx.app
                </text>
              </svg>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
