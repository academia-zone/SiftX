/**
 * High-Precision Unit Converter Engine
 * Covers: Length, Mass, Temperature, Digital Data Storage (SI vs IEC)
 */

export type UnitCategory = 'length' | 'mass' | 'temperature' | 'digital';

export interface ConversionResult {
  fromValue: number;
  fromUnit: string;
  toUnit: string;
  result: number;
  category: UnitCategory;
  note?: string;
}

// Length: base is meter (m)
const LENGTH_FACTORS: Record<string, number> = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

// Mass: base is kilogram (kg)
const MASS_FACTORS: Record<string, number> = {
  kg: 1,
  g: 0.001,
  mg: 0.000001,
  lb: 0.45359237,
  oz: 0.028349523125,
  tonne: 1000,
};

// Digital Storage: base is Byte (B)
// SI decimal standard vs IEC binary standard
const DIGITAL_FACTORS: Record<string, number> = {
  B: 1,
  KB: 1000,
  MB: 1000000,
  GB: 1000000000,
  TB: 1000000000000,
  KiB: 1024,
  MiB: 1048576,
  GiB: 1073741824,
  TiB: 1099511627776,
};

export function convertUnits(
  value: number,
  category: UnitCategory,
  fromUnit: string,
  toUnit: string
): ConversionResult {
  if (isNaN(value)) {
    return { fromValue: 0, fromUnit, toUnit, result: 0, category };
  }

  if (category === 'length') {
    const fFrom = LENGTH_FACTORS[fromUnit] ?? 1;
    const fTo = LENGTH_FACTORS[toUnit] ?? 1;
    const meters = value * fFrom;
    const res = meters / fTo;
    return { fromValue: value, fromUnit, toUnit, result: cleanFloat(res), category };
  }

  if (category === 'mass') {
    const fFrom = MASS_FACTORS[fromUnit] ?? 1;
    const fTo = MASS_FACTORS[toUnit] ?? 1;
    const kg = value * fFrom;
    const res = kg / fTo;
    return { fromValue: value, fromUnit, toUnit, result: cleanFloat(res), category };
  }

  if (category === 'digital') {
    const fFrom = DIGITAL_FACTORS[fromUnit] ?? 1;
    const fTo = DIGITAL_FACTORS[toUnit] ?? 1;
    const bytes = value * fFrom;
    const res = bytes / fTo;
    const isBinary = fromUnit.endsWith('iB') || toUnit.endsWith('iB');
    return {
      fromValue: value,
      fromUnit,
      toUnit,
      result: cleanFloat(res),
      category,
      note: isBinary ? 'IEC Binary standard (1024 base)' : 'SI Decimal standard (1000 base)',
    };
  }

  if (category === 'temperature') {
    // Base is Celsius
    let celsius = value;
    if (fromUnit === 'F') {
      celsius = (value - 32) * (5 / 9);
    } else if (fromUnit === 'K') {
      celsius = value - 273.15;
    }

    let target = celsius;
    if (toUnit === 'F') {
      target = celsius * (9 / 5) + 32;
    } else if (toUnit === 'K') {
      target = celsius + 273.15;
    }

    return { fromValue: value, fromUnit, toUnit, result: cleanFloat(target), category };
  }

  return { fromValue: value, fromUnit, toUnit, result: value, category };
}

function cleanFloat(val: number): number {
  if (Math.abs(val) < 1e-12) return 0;
  return Number(parseFloat(val.toPrecision(10)).toFixed(6).replace(/\.?0+$/, ''));
}
