/**
 * Electricity Bill Tariff Engine (Pakistan NEPRA Slab Estimation Model)
 * Slabs based on standard residential schedule with FPA, taxes, and TV fee.
 */

export interface ElectricityResult {
  units: number;
  connectionType: 'protected' | 'unprotected';
  baseEnergyCost: number;
  fuelPriceAdjustment: number;
  electricityDuty: number;
  salesTax: number;
  tvFee: number;
  totalEstimatedBill: number;
  effectiveRatePerUnit: number;
  disclaimer: string;
}

export function calculateElectricityBill(units: number, connectionType: 'protected' | 'unprotected' = 'unprotected'): ElectricityResult {
  const safeUnits = Math.max(0, units);
  let baseEnergyCost = 0;

  if (connectionType === 'protected') {
    // Protected Consumers (Up to 200 units consistent usage)
    if (safeUnits <= 50) {
      baseEnergyCost = safeUnits * 3.95;
    } else if (safeUnits <= 100) {
      baseEnergyCost = 50 * 3.95 + (safeUnits - 50) * 7.74;
    } else {
      baseEnergyCost = 50 * 3.95 + 50 * 7.74 + (safeUnits - 100) * 10.06;
    }
  } else {
    // Unprotected Consumers (Standard tiered slabs)
    if (safeUnits <= 100) {
      baseEnergyCost = safeUnits * 16.48;
    } else if (safeUnits <= 200) {
      baseEnergyCost = 100 * 16.48 + (safeUnits - 100) * 22.95;
    } else if (safeUnits <= 300) {
      baseEnergyCost = 100 * 16.48 + 100 * 22.95 + (safeUnits - 200) * 27.14;
    } else if (safeUnits <= 700) {
      baseEnergyCost = 100 * 16.48 + 100 * 22.95 + 100 * 27.14 + (safeUnits - 300) * 32.03;
    } else {
      baseEnergyCost = 100 * 16.48 + 100 * 22.95 + 100 * 27.14 + 400 * 32.03 + (safeUnits - 700) * 35.24;
    }
  }

  // Surcharges & Taxes
  const fuelPriceAdjustment = safeUnits * 3.25; // Benchmark FPA estimation
  const electricityDuty = baseEnergyCost * 0.015; // 1.5% ED
  const salesTax = safeUnits > 200 ? baseEnergyCost * 0.18 : 0; // 18% GST on commercial or >200 units
  const tvFee = 35; // Standard PTV fee

  const totalEstimatedBill = baseEnergyCost + fuelPriceAdjustment + electricityDuty + salesTax + tvFee;
  const effectiveRate = safeUnits > 0 ? totalEstimatedBill / safeUnits : 0;

  return {
    units: safeUnits,
    connectionType,
    baseEnergyCost: Math.round(baseEnergyCost),
    fuelPriceAdjustment: Math.round(fuelPriceAdjustment),
    electricityDuty: Math.round(electricityDuty),
    salesTax: Math.round(salesTax),
    tvFee,
    totalEstimatedBill: Math.round(totalEstimatedBill),
    effectiveRatePerUnit: Number(effectiveRate.toFixed(2)),
    disclaimer: 'Based on NEPRA standard residential tariff schedule. Actual DISCO bills (LESCO, K-Electric, IESCO) may vary with monthly FCA adjustments and municipal taxes.',
  };
}
