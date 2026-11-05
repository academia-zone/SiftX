import React, { useState, useMemo } from 'react';
import { ArrowRightLeft, Copy, Check, RotateCcw, Info } from 'lucide-react';

type UnitCategory = 'length' | 'mass' | 'temperature' | 'digital' | 'speed';

interface UnitDefinition {
  name: string;
  factor: number; // relative to base
}

const UNIT_CONFIGS: Record<UnitCategory, { label: string; base: string; units: Record<string, UnitDefinition> }> = {
  length: {
    label: 'Length & Distance',
    base: 'meter',
    units: {
      m: { name: 'Meters (m)', factor: 1 },
      km: { name: 'Kilometers (km)', factor: 1000 },
      cm: { name: 'Centimeters (cm)', factor: 0.01 },
      mm: { name: 'Millimeters (mm)', factor: 0.001 },
      ft: { name: 'Feet (ft)', factor: 0.3048 },
      inch: { name: 'Inches (in)', factor: 0.0254 },
      yard: { name: 'Yards (yd)', factor: 0.9144 },
      mile: { name: 'Miles (mi)', factor: 1609.344 },
    },
  },
  mass: {
    label: 'Mass & Weight',
    base: 'kg',
    units: {
      kg: { name: 'Kilograms (kg)', factor: 1 },
      g: { name: 'Grams (g)', factor: 0.001 },
      mg: { name: 'Milligrams (mg)', factor: 0.000001 },
      lb: { name: 'Pounds (lbs)', factor: 0.45359237 },
      oz: { name: 'Ounces (oz)', factor: 0.028349523125 },
      ton: { name: 'Metric Tons (t)', factor: 1000 },
    },
  },
  digital: {
    label: 'Digital Storage (SI & IEC)',
    base: 'MB',
    units: {
      B: { name: 'Bytes (B)', factor: 0.000001 },
      KB: { name: 'Kilobytes (KB - 1,000 B)', factor: 0.001 },
      MB: { name: 'Megabytes (MB - 1,000 KB)', factor: 1 },
      GB: { name: 'Gigabytes (GB - 1,000 MB)', factor: 1000 },
      TB: { name: 'Terabytes (TB - 1,000 GB)', factor: 1000000 },
      KiB: { name: 'Kibibytes (KiB - 1,024 B)', factor: 0.001024 },
      MiB: { name: 'Mebibytes (MiB - 1,024 KiB)', factor: 1.048576 },
      GiB: { name: 'Gibibytes (GiB - 1,024 MiB)', factor: 1073.741824 },
      TiB: { name: 'Tebibytes (TiB - 1,024 GiB)', factor: 1099511.627776 },
    },
  },
  speed: {
    label: 'Speed & Velocity',
    base: 'mps',
    units: {
      kmh: { name: 'Kilometers/hour (km/h)', factor: 0.277778 },
      mph: { name: 'Miles/hour (mph)', factor: 0.44704 },
      mps: { name: 'Meters/second (m/s)', factor: 1 },
      knot: { name: 'Knots (kn)', factor: 0.514444 },
    },
  },
  temperature: {
    label: 'Temperature',
    base: 'celsius',
    units: {
      C: { name: 'Celsius (°C)', factor: 1 },
      F: { name: 'Fahrenheit (°F)', factor: 1 },
      K: { name: 'Kelvin (K)', factor: 1 },
    },
  },
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [amount, setAmount] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('ft');
  const [copied, setCopied] = useState<boolean>(false);

  // Handle category switch
  const handleCategorySwitch = (cat: UnitCategory) => {
    setCategory(cat);
    const keys = Object.keys(UNIT_CONFIGS[cat].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  const convertedValue = useMemo(() => {
    const val = Number(amount) || 0;
    if (category === 'temperature') {
      let celsius = val;
      if (fromUnit === 'F') celsius = ((val - 32) * 5) / 9;
      if (fromUnit === 'K') celsius = val - 273.15;

      if (toUnit === 'C') return Number(celsius.toFixed(4));
      if (toUnit === 'F') return Number(((celsius * 9) / 5 + 32).toFixed(4));
      if (toUnit === 'K') return Number((celsius + 273.15).toFixed(4));
      return celsius;
    }

    const conf = UNIT_CONFIGS[category];
    const fromFactor = conf.units[fromUnit]?.factor || 1;
    const toFactor = conf.units[toUnit]?.factor || 1;

    // Value in base unit
    const inBase = val * fromFactor;
    const inTarget = inBase / toFactor;
    return Number(inTarget.toFixed(6));
  }, [category, amount, fromUnit, toUnit]);

  const handleCopy = () => {
    const text = `${amount} ${fromUnit} = ${convertedValue} ${toUnit}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDigital = category === 'digital';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* Left Input (5 Cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm text-slate-900">
            Select Category
          </h3>
          <button
            onClick={() => setAmount(100)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(UNIT_CONFIGS) as UnitCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySwitch(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                category === cat 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {UNIT_CONFIGS[cat].label}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-700">Value to Convert</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {/* From & To Unit Pickers */}
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400">From Unit:</span>
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
            >
              {Object.entries(UNIT_CONFIGS[category].units).map(([key, def]) => (
                <option key={key} value={key}>{def.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={swapUnits}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 transition-all cursor-pointer shadow-xs"
              title="Swap Units"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400">To Unit:</span>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
            >
              {Object.entries(UNIT_CONFIGS[category].units).map(([key, def]) => (
                <option key={key} value={key}>{def.name}</option>
              ))}
            </select>
          </div>
        </div>

        {isDigital && (
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <Info className="w-3.5 h-3.5 text-emerald-600" />
              <span>Decimal (SI) vs Binary (IEC) Storage</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Storage drive manufacturers use decimal (1 GB = 1,000 MB), while operating systems measure RAM in binary gibibytes (1 GiB = 1,024 MiB). Both standards are supported here.
            </p>
          </div>
        )}
      </div>

      {/* Right Result Card (7 Cols) */}
      <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Converted Value</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1 font-mono">
              {convertedValue.toLocaleString()}{' '}
              <span className="text-base font-bold text-emerald-700">{UNIT_CONFIGS[category].units[toUnit]?.name}</span>
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

        {/* Reciprocal Equation */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-mono space-y-1">
          <span className="text-slate-400 font-sans block text-[11px] font-bold">Conversion Equation:</span>
          <span className="text-slate-800 font-bold block text-sm">
            {amount} {fromUnit} = {convertedValue} {toUnit}
          </span>
        </div>
      </div>

    </div>
  );
};
