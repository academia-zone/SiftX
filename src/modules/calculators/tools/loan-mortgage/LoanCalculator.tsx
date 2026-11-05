import React, { useState, useMemo, useRef } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Printer, 
  RotateCcw 
} from 'lucide-react';
import { downloadSvgAsPng, printElementAsPdf } from '../../shared/cardExporter';

export const LoanCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(1500000);
  const [interestRate, setInterestRate] = useState<number>(14.5);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [showAmortization, setShowAmortization] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const cardSvgRef = useRef<SVGSVGElement>(null);

  const stats = useMemo(() => {
    const P = Math.max(0, loanAmount);
    const annualR = Math.max(0, interestRate);
    const N = Math.max(1, tenureYears * 12);
    const r = annualR / 12 / 100;

    let emi = 0;
    if (r === 0) {
      emi = P / N;
    } else {
      emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    }

    const totalPayment = emi * N;
    const totalInterest = totalPayment - P;
    const principalPercent = totalPayment > 0 ? (P / totalPayment) * 100 : 0;
    const interestPercent = 100 - principalPercent;

    // Yearly Amortization Schedule
    const schedule: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = [];
    let balance = P;
    for (let y = 1; y <= tenureYears; y++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      for (let m = 1; m <= 12; m++) {
        const interestMonth = balance * r;
        const principalMonth = emi - interestMonth;
        yearlyInterest += interestMonth;
        yearlyPrincipal += principalMonth;
        balance = Math.max(0, balance - principalMonth);
      }
      schedule.push({
        year: y,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        balance: Math.round(balance),
      });
    }

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
      principalPercent: Math.round(principalPercent),
      interestPercent: Math.round(interestPercent),
      schedule,
    };
  }, [loanAmount, interestRate, tenureYears]);

  const handleDownloadImage = async () => {
    if (!cardSvgRef.current) return;
    try {
      setIsExporting(true);
      await downloadSvgAsPng(cardSvgRef.current, `loan_statement_siftx.png`, 2);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PNG statement');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    printElementAsPdf('loan-report-printable-area', 'SiftX Loan & Mortgage Statement');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">
              Loan Parameters
            </h3>
            <button
              onClick={() => {
                setLoanAmount(1500000);
                setInterestRate(14.5);
                setTenureYears(5);
              }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Principal Amount */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex justify-between">
              <span>Loan Amount (Principal)</span>
              <span className="text-emerald-700 font-mono text-sm font-bold">Rs. {loanAmount.toLocaleString()}</span>
            </label>
            <input
              type="number"
              min="10000"
              max="50000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-3 rounded-2xl border border-slate-200 font-bold font-mono text-slate-900 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {[500000, 1000000, 2500000, 5000000, 10000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setLoanAmount(preset)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    loanAmount === preset ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {(preset / 100000).toFixed(0)} Lakh
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex justify-between">
              <span>Annual Interest Rate (%)</span>
              <span className="text-emerald-700 font-mono text-sm font-bold">{interestRate}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="30"
              step="0.25"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer h-1.5"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5% (Subsidized)</span>
              <span>15% (Commercial)</span>
              <span>30% (High Risk)</span>
            </div>
          </div>

          {/* Tenure (Years) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex justify-between">
              <span>Loan Tenure</span>
              <span className="text-emerald-700 font-mono text-sm font-bold">{tenureYears} Years ({tenureYears * 12} Months)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 7, 10, 15, 20, 25].map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setTenureYears(y)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tenureYears === y
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {y} Yrs
                </button>
              ))}
            </div>
          </div>

          {/* Export Actions Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Save & Export Loan Statement
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

        {/* Right Summary Card (7 Cols) */}
        <div id="loan-report-printable-area" className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Installment (EMI)</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-0.5 font-mono">
                Rs. {stats.monthlyEmi.toLocaleString()}
              </h2>
            </div>
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
              {interestRate}% Fixed Rate
            </span>
          </div>

          {/* Total Payment Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-1 text-[11px]">Total Interest Payable:</span>
              <span className="font-mono font-bold text-amber-700 text-base">
                Rs. {stats.totalInterest.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 block mb-1 text-[11px]">Total Repayment (Principal + Interest):</span>
              <span className="font-mono font-bold text-slate-900 text-base">
                Rs. {stats.totalPayment.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Visual Ratio Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-emerald-700">Principal: {stats.principalPercent}%</span>
              <span className="text-amber-700">Total Interest: {stats.interestPercent}%</span>
            </div>
            <div className="h-3.5 w-full bg-amber-400 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${stats.principalPercent}%` }}
                className="bg-emerald-600 h-full transition-all duration-300"
              />
            </div>
          </div>

          {/* Amortization Schedule Accordion */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAmortization(!showAmortization)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900 py-2 cursor-pointer"
            >
              <span>View Annual Amortization Table ({tenureYears} Years)</span>
              {showAmortization ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAmortization && (
              <div className="mt-3 overflow-x-auto max-h-60 overflow-y-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Year</th>
                      <th className="p-2.5">Principal Paid</th>
                      <th className="p-2.5">Interest Paid</th>
                      <th className="p-2.5">Remaining Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {stats.schedule.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50/60">
                        <td className="p-2.5 font-bold text-slate-800">Year {row.year}</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">Rs. {row.principalPaid.toLocaleString()}</td>
                        <td className="p-2.5 text-amber-700 font-semibold">Rs. {row.interestPaid.toLocaleString()}</td>
                        <td className="p-2.5 text-slate-900 font-bold">Rs. {row.balance.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Hidden SVG for Export */}
          <div className="hidden">
            <svg
              ref={cardSvgRef}
              width="640"
              height="380"
              viewBox="0 0 640 380"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="640" height="380" rx="32" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
              <text x="40" y="50" fill="#059669" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                SIFTX • LOAN & MORTGAGE FINANCING SUMMARY
              </text>
              <text x="40" y="115" fill="#0f172a" fontSize="36" fontWeight="900" fontFamily="sans-serif">
                Rs. {stats.monthlyEmi.toLocaleString()} <tspan fontSize="18" fill="#64748b" fontWeight="normal">/ month</tspan>
              </text>
              <rect x="40" y="150" width="560" height="75" rx="16" fill="#f8fafc" stroke="#e2e8f0" />
              <text x="60" y="180" fill="#64748b" fontSize="11" fontFamily="sans-serif">LOAN PRINCIPAL</text>
              <text x="60" y="205" fill="#059669" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
                Rs. {loanAmount.toLocaleString()}
              </text>
              <text x="250" y="180" fill="#64748b" fontSize="11" fontFamily="sans-serif">TOTAL INTEREST</text>
              <text x="250" y="205" fill="#d97706" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
                Rs. {stats.totalInterest.toLocaleString()}
              </text>
              <text x="430" y="180" fill="#64748b" fontSize="11" fontFamily="sans-serif">TENURE</text>
              <text x="430" y="205" fill="#0f172a" fontSize="18" fontWeight="bold" fontFamily="sans-serif">
                {tenureYears} Years ({interestRate}%)
              </text>
              {/* Ratio Bar */}
              <rect x="40" y="250" width="560" height="18" rx="9" fill="#fbbf24" />
              <rect x="40" y="250" width={(560 * stats.principalPercent) / 100} height="18" rx="9" fill="#059669" />
              <text x="40" y="290" fill="#059669" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                Principal: {stats.principalPercent}%
              </text>
              <text x="480" y="290" fill="#d97706" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                Interest: {stats.interestPercent}%
              </text>
              <text x="40" y="340" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
                Generated with 100% Amortization Precision • SiftX Client Engines
              </text>
              <text x="530" y="340" fill="#059669" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                siftx.app
              </text>
            </svg>
          </div>

        </div>

      </div>
    </div>
  );
};
