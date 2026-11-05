import React, { useState, useMemo, useRef } from 'react';
import { 
  Calendar, 
  Cake, 
  Copy, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Download, 
  Heart, 
  Wind, 
  Compass, 
  Moon, 
  Printer
} from 'lucide-react';
import { calculateAge } from '../../engines/ageDateEngine';
import { downloadSvgAsPng, printElementAsPdf } from '../../shared/cardExporter';

interface ZodiacInfo {
  name: string;
  symbol: string;
  element: string;
}

function getZodiacSign(month1to12: number, day: number): ZodiacInfo {
  if ((month1to12 === 3 && day >= 21) || (month1to12 === 4 && day <= 19)) return { name: 'Aries', symbol: '♈', element: 'Fire' };
  if ((month1to12 === 4 && day >= 20) || (month1to12 === 5 && day <= 20)) return { name: 'Taurus', symbol: '♉', element: 'Earth' };
  if ((month1to12 === 5 && day >= 21) || (month1to12 === 6 && day <= 20)) return { name: 'Gemini', symbol: '♊', element: 'Air' };
  if ((month1to12 === 6 && day >= 21) || (month1to12 === 7 && day <= 22)) return { name: 'Cancer', symbol: '♋', element: 'Water' };
  if ((month1to12 === 7 && day >= 23) || (month1to12 === 8 && day <= 22)) return { name: 'Leo', symbol: '♌', element: 'Fire' };
  if ((month1to12 === 8 && day >= 23) || (month1to12 === 9 && day <= 22)) return { name: 'Virgo', symbol: '♍', element: 'Earth' };
  if ((month1to12 === 9 && day >= 23) || (month1to12 === 10 && day <= 22)) return { name: 'Libra', symbol: '♎', element: 'Air' };
  if ((month1to12 === 10 && day >= 23) || (month1to12 === 11 && day <= 21)) return { name: 'Scorpio', symbol: '♏', element: 'Water' };
  if ((month1to12 === 11 && day >= 22) || (month1to12 === 12 && day <= 21)) return { name: 'Sagittarius', symbol: '♐', element: 'Fire' };
  if ((month1to12 === 12 && day >= 22) || (month1to12 === 1 && day <= 19)) return { name: 'Capricorn', symbol: '♑', element: 'Earth' };
  if ((month1to12 === 1 && day >= 20) || (month1to12 === 2 && day <= 18)) return { name: 'Aquarius', symbol: '♒', element: 'Air' };
  return { name: 'Pisces', symbol: '♓', element: 'Water' };
}

export const AgeDateCalculator: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [dob, setDob] = useState<string>('2000-05-15');
  const [asOfDate, setAsOfDate] = useState<string>(todayStr);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const cardSvgRef = useRef<SVGSVGElement>(null);

  const birthDateObj = useMemo(() => new Date(dob + 'T00:00:00'), [dob]);

  const stats = useMemo(() => {
    if (!dob || !asOfDate) return null;
    const res = calculateAge(dob, asOfDate);
    if (res.error) return null;
    return res;
  }, [dob, asOfDate]);

  const zodiac = useMemo(() => {
    if (isNaN(birthDateObj.getTime())) return { name: 'Taurus', symbol: '♉', element: 'Earth' };
    return getZodiacSign(birthDateObj.getMonth() + 1, birthDateObj.getDate());
  }, [birthDateObj]);

  const dayOfWeek = useMemo(() => {
    if (isNaN(birthDateObj.getTime())) return 'Monday';
    return birthDateObj.toLocaleDateString('en-US', { weekday: 'long' });
  }, [birthDateObj]);

  // Fun milestones
  const funFacts = useMemo(() => {
    if (!stats) return null;
    const heartbeats = (stats.totalDays * 100000).toLocaleString();
    const breaths = (stats.totalDays * 22000).toLocaleString();
    const orbitalKm = ((stats.years + stats.months / 12) * 940).toFixed(0);
    const sleepingYears = ((stats.years + stats.months / 12) * 0.33).toFixed(1);

    return {
      heartbeats,
      breaths,
      orbitalKm,
      sleepingYears,
    };
  }, [stats]);

  const handleCopy = () => {
    if (!stats) return;
    const text = `${stats.years} Years, ${stats.months} Months, ${stats.days} Days (Born on a ${dayOfWeek}, Zodiac: ${zodiac.symbol} ${zodiac.name})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setDob('2000-05-15');
    setAsOfDate(todayStr);
  };

  const handleDownloadImage = async () => {
    if (!cardSvgRef.current) return;
    try {
      setIsExporting(true);
      await downloadSvgAsPng(cardSvgRef.current, `birthday_card_${dob}_siftx.png`, 2);
    } catch (err) {
      console.error(err);
      alert('Failed to download card image');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    printElementAsPdf('age-report-printable-area', `Birthday & Age Report - ${dob}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* Left Input (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900">
            Date Selection
          </h3>
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Cake className="w-3.5 h-3.5 text-pink-500" />
            <span>Date of Birth</span>
          </label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full p-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Age as of Date</span>
          </label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="w-full p-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
          <button
            type="button"
            onClick={() => setAsOfDate(todayStr)}
            className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
          >
            Set to Today
          </button>
        </div>

        {/* Fun Birth Facts Box */}
        {stats && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50/70 via-purple-50/50 to-slate-50 border border-pink-100 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-pink-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>Cosmic & Birth Facts</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-purple-700 border border-purple-200">
                {zodiac.element} Element
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/80 border border-pink-100">
                <span className="text-slate-400 block text-[10px]">Born on a</span>
                <span className="font-extrabold text-slate-800 text-xs">{dayOfWeek}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 border border-pink-100">
                <span className="text-slate-400 block text-[10px]">Zodiac Sign</span>
                <span className="font-extrabold text-purple-800 text-xs">{zodiac.symbol} {zodiac.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* Export Actions Bar */}
        <div className="pt-2 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Save & Export Card
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

      {/* Right Stats & Visual Card Summary (7 Cols) */}
      <div id="age-report-printable-area" className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        {stats ? (
          <>
            {/* Primary Age Highlight */}
            <div className="p-6 rounded-3xl bg-gradient-to-tr from-emerald-50/80 via-teal-50/40 to-slate-50 border border-emerald-100 text-center space-y-3 relative overflow-hidden">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Your Exact Chronological Age
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                <span className="text-emerald-700 font-mono">{stats.years}</span> Years,{' '}
                <span className="text-emerald-700 font-mono">{stats.months}</span> Months,{' '}
                <span className="text-emerald-700 font-mono">{stats.days}</span> Days
              </div>

              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:border-emerald-300 text-xs font-bold text-slate-700 hover:text-emerald-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Details' : 'Copy Age & Details'}</span>
                </button>
              </div>
            </div>

            {/* Next Birthday Banner */}
            <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Cake className="w-5 h-5 text-pink-600 flex-shrink-0" />
                <div>
                  <span className="font-extrabold text-pink-900 block">Next Birthday Celebration:</span>
                  <span className="text-pink-700">Only {stats.nextBirthdayDays} days remaining</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-white text-pink-700 rounded-full shadow-xs">
                {stats.nextBirthdayDays} Days
              </span>
            </div>

            {/* Interesting Biological & Cosmic Milestones */}
            {funFacts && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Life Journey Milestones
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-center">
                    <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                    <span className="text-slate-500 block text-[10px]">Heartbeats</span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block truncate" title={`${funFacts.heartbeats} times`}>
                      ~{funFacts.heartbeats}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 text-center">
                    <Wind className="w-4 h-4 text-sky-500 mx-auto mb-1" />
                    <span className="text-slate-500 block text-[10px]">Breaths Taken</span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block truncate" title={`${funFacts.breaths} times`}>
                      ~{funFacts.breaths}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                    <Compass className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <span className="text-slate-500 block text-[10px]">Solar Orbit</span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block truncate">
                      {funFacts.orbitalKm}M km
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-center">
                    <Moon className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <span className="text-slate-500 block text-[10px]">Time Asleep</span>
                    <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
                      ~{funFacts.sleepingYears} yrs
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden High-Definition SVG Infographic Card for PNG Export */}
            <div className="hidden">
              <svg
                ref={cardSvgRef}
                width="640"
                height="400"
                viewBox="0 0 640 400"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ecfdf5" />
                    <stop offset="50%" stopColor="#f0fdf4" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
                
                {/* Background Card */}
                <rect width="640" height="400" rx="32" fill="url(#cardGrad)" stroke="#10b981" strokeWidth="2" />
                
                {/* Watermark branding */}
                <text x="40" y="50" fill="#059669" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                  SIFTX • AGE & LIFE MILESTONE CERTIFICATE
                </text>

                {/* Main Age */}
                <text x="40" y="115" fill="#0f172a" fontSize="32" fontWeight="900" fontFamily="sans-serif">
                  {stats.years} Years, {stats.months} Months, {stats.days} Days
                </text>

                <text x="40" y="150" fill="#64748b" fontSize="14" fontFamily="sans-serif">
                  Born on {dayOfWeek}, {dob} • Total Days on Earth: {stats.totalDays.toLocaleString()}
                </text>

                {/* Dividers */}
                <line x1="40" y1="180" x2="600" y2="180" stroke="#cbd5e1" strokeWidth="1" />

                {/* Milestone 1: Zodiac */}
                <rect x="40" y="205" width="125" height="85" rx="16" fill="#ffffff" stroke="#e2e8f0" />
                <text x="55" y="235" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">ZODIAC SIGN</text>
                <text x="55" y="265" fill="#7c3aed" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
                  {zodiac.symbol} {zodiac.name}
                </text>

                {/* Milestone 2: Heartbeats */}
                <rect x="180" y="205" width="125" height="85" rx="16" fill="#ffffff" stroke="#e2e8f0" />
                <text x="195" y="235" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">HEARTBEATS</text>
                <text x="195" y="265" fill="#e11d48" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                  ~{(stats.totalDays * 100).toLocaleString()}k
                </text>

                {/* Milestone 3: Breaths */}
                <rect x="320" y="205" width="125" height="85" rx="16" fill="#ffffff" stroke="#e2e8f0" />
                <text x="335" y="235" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">BREATHS</text>
                <text x="335" y="265" fill="#0284c7" fontSize="15" fontWeight="bold" fontFamily="sans-serif">
                  ~{(stats.totalDays * 22).toLocaleString()}k
                </text>

                {/* Milestone 4: Next Birthday */}
                <rect x="460" y="205" width="140" height="85" rx="16" fill="#ffffff" stroke="#e2e8f0" />
                <text x="475" y="235" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">NEXT BIRTHDAY</text>
                <text x="475" y="265" fill="#db2777" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                  {stats.nextBirthdayDays} Days
                </text>

                {/* Footer */}
                <text x="40" y="345" fill="#64748b" fontSize="12" fontFamily="sans-serif">
                  Calculated with 100% Calendar Precision • SiftX Client Engineering
                </text>
                <text x="520" y="345" fill="#059669" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                  siftx.app
                </text>
              </svg>
            </div>
          </>
        ) : (
          <p className="text-xs text-rose-500 py-10 text-center">
            Please enter a valid date of birth earlier than the target comparison date.
          </p>
        )}
      </div>

    </div>
  );
};
