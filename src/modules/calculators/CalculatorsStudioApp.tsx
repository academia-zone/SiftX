import React, { useState } from 'react';
import { 
  Calculator, 
  ArrowLeft, 
  Zap, 
  GraduationCap, 
  Landmark, 
  Percent, 
  Calendar, 
  Tag, 
  HeartPulse, 
  Receipt, 
  TrendingUp, 
  Scale, 
  DollarSign,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { CALCULATOR_TOOLS, type CalculatorToolId } from './types/calculatorTypes';
import { CalculatorsDashboard } from './dashboard/CalculatorsDashboard';

// All 12 Calculators
import { ElectricityBillCalculator } from './tools/electricity-bill/ElectricityBillCalculator';
import { GpaCgpaCalculator } from './tools/gpa-cgpa/GpaCgpaCalculator';
import { LoanCalculator } from './tools/loan-mortgage/LoanCalculator';
import { ScientificCalculator } from './tools/scientific/ScientificCalculator';
import { PercentageCalculator } from './tools/percentage/PercentageCalculator';
import { AgeDateCalculator } from './tools/age-date/AgeDateCalculator';
import { DiscountCalculator } from './tools/discount/DiscountCalculator';
import { BmiCalculator } from './tools/bmi/BmiCalculator';
import { GstCalculator } from './tools/gst-tax/GstCalculator';
import { ProfitLossCalculator } from './tools/profit-loss/ProfitLossCalculator';
import { UnitConverter } from './tools/unit-converter/UnitConverter';
import { CurrencyCalculator } from './tools/currency/CurrencyCalculator';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Zap,
  GraduationCap,
  Landmark,
  Calculator,
  Percent,
  Calendar,
  Tag,
  HeartPulse,
  Receipt,
  TrendingUp,
  Scale,
  DollarSign,
};

interface CalculatorsStudioAppProps {
  initialToolId?: CalculatorToolId | 'dashboard';
  onExitToMain: () => void;
}

export const CalculatorsStudioApp: React.FC<CalculatorsStudioAppProps> = ({
  initialToolId = 'dashboard',
  onExitToMain,
}) => {
  const [currentView, setCurrentView] = useState<CalculatorToolId | 'dashboard'>(initialToolId);

  const activeToolMeta = CALCULATOR_TOOLS.find((t) => t.id === currentView);
  const ActiveIcon = activeToolMeta ? (ICON_MAP[activeToolMeta.iconName] || Calculator) : Calculator;

  const renderActiveCalculator = () => {
    switch (currentView) {
      case 'electricity-bill':
        return <ElectricityBillCalculator />;
      case 'gpa-cgpa':
        return <GpaCgpaCalculator />;
      case 'loan-mortgage':
        return <LoanCalculator />;
      case 'scientific':
        return <ScientificCalculator />;
      case 'percentage':
        return <PercentageCalculator />;
      case 'age-date':
        return <AgeDateCalculator />;
      case 'discount':
        return <DiscountCalculator />;
      case 'bmi':
        return <BmiCalculator />;
      case 'gst-tax':
        return <GstCalculator />;
      case 'profit-loss':
        return <ProfitLossCalculator />;
      case 'unit-converter':
        return <UnitConverter />;
      case 'currency':
        return <CurrencyCalculator />;
      default:
        return <ElectricityBillCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* Top Studio Navbar with Signature Emerald / Mint Theme */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left Brand & Title */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => setCurrentView('dashboard')}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-slate-900">
                    SiftX
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Calculators Studio
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">100% Client-Side Math Engines</span>
              </div>
            </div>

            <button
              onClick={onExitToMain}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Tool Links / Dashboard Button */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Studio Dashboard</span>
            </button>

            {/* Quick direct switch pills for top tools */}
            {[
              { id: 'electricity-bill' as CalculatorToolId, label: 'Electricity' },
              { id: 'scientific' as CalculatorToolId, label: 'Scientific' },
              { id: 'loan-mortgage' as CalculatorToolId, label: 'Loan' },
              { id: 'percentage' as CalculatorToolId, label: 'Percentage' },
              { id: 'age-date' as CalculatorToolId, label: 'Age & Date' },
            ].map((quick) => (
              <button
                key={quick.id}
                onClick={() => setCurrentView(quick.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentView === quick.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {quick.label}
              </button>
            ))}

            <button
              onClick={onExitToMain}
              className="px-4 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white text-xs font-bold text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ml-2 whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to All Tools</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {currentView === 'dashboard' ? (
          /* Calculators Dashboard View */
          <CalculatorsDashboard onSelectTool={(toolId) => setCurrentView(toolId)} />
        ) : (
          /* Dedicated Calculator Workspace View */
          <div className="space-y-6">
            
            {/* Breadcrumb & Navigation Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>Back to Calculators Dashboard</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified Client Calculation</span>
                </span>
              </div>
            </div>

            {/* Dedicated Calculator Hero Banner (Ready for background image) */}
            <div className="rounded-3xl p-6 sm:p-7 border border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-white text-slate-900 shadow-xs relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200 shadow-sm flex items-center justify-center text-emerald-700 flex-shrink-0">
                  <ActiveIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {activeToolMeta?.name}
                    </h1>
                    {activeToolMeta?.badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {activeToolMeta.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-normal">
                    {activeToolMeta?.tagline}
                  </p>
                </div>
              </div>

              {/* Category Pill */}
              <div className="relative z-10 self-start sm:self-center">
                <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                  Category: {activeToolMeta?.category}
                </span>
              </div>

              {/* Ambient Glow / Ready for Background Header Image */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-200/30 blur-2xl pointer-events-none" />
            </div>

            {/* Quick Switch Ribbon between other calculators */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-xs">
              {CALCULATOR_TOOLS.map((t) => {
                const Icon = ICON_MAP[t.iconName] || Calculator;
                const isSelected = currentView === t.id;

                return (
                  <button
                    key={t.id}
                    onClick={() => setCurrentView(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Calculator Component */}
            <div className="pt-2">
              {renderActiveCalculator()}
            </div>

          </div>
        )}

      </main>

    </div>
  );
};
