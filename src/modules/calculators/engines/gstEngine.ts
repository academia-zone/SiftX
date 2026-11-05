/**
 * GST & Sales Tax Calculation Engine
 * Inclusive vs Exclusive Sales Tax
 */

export interface GstResult {
  baseAmount: number;
  taxRatePercent: number;
  taxAmount: number;
  totalAmount: number;
  mode: 'exclusive' | 'inclusive';
}

export function calculateGstExclusive(baseAmount: number, taxRatePercent: number): GstResult {
  const safeAmount = Math.max(0, baseAmount);
  const safeRate = Math.max(0, taxRatePercent);

  const taxAmount = (safeRate / 100) * safeAmount;
  const totalAmount = safeAmount + taxAmount;

  return {
    baseAmount: safeAmount,
    taxRatePercent: safeRate,
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    mode: 'exclusive',
  };
}

export function calculateGstInclusive(grossAmount: number, taxRatePercent: number): GstResult {
  const safeGross = Math.max(0, grossAmount);
  const safeRate = Math.max(0, taxRatePercent);

  // base = gross / (1 + rate/100)
  const baseAmount = safeGross / (1 + safeRate / 100);
  const taxAmount = safeGross - baseAmount;

  return {
    baseAmount: Number(baseAmount.toFixed(2)),
    taxRatePercent: safeRate,
    taxAmount: Number(taxAmount.toFixed(2)),
    totalAmount: safeGross,
    mode: 'inclusive',
  };
}
