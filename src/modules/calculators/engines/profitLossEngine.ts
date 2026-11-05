/**
 * Profit & Loss, Margin & Markup Engine
 */

export interface ProfitLossResult {
  costPrice: number;
  sellingPrice: number;
  profitOrLossAmount: number;
  isProfit: boolean;
  isBreakeven: boolean;
  profitMarginPercent: number; // (Profit / Selling Price) * 100
  markupPercent: number; // (Profit / Cost Price) * 100
  error?: string;
}

export function calculateProfitLoss(costPrice: number, sellingPrice: number): ProfitLossResult {
  const safeCost = Math.max(0, costPrice);
  const safeSelling = Math.max(0, sellingPrice);

  const diff = safeSelling - safeCost;
  const isProfit = diff > 0;
  const isBreakeven = Math.abs(diff) < 1e-9;

  let profitMarginPercent = 0;
  if (safeSelling > 0) {
    profitMarginPercent = Number(((diff / safeSelling) * 100).toFixed(2));
  }

  let markupPercent = 0;
  if (safeCost > 0) {
    markupPercent = Number(((diff / safeCost) * 100).toFixed(2));
  }

  return {
    costPrice: safeCost,
    sellingPrice: safeSelling,
    profitOrLossAmount: Number(Math.abs(diff).toFixed(2)),
    isProfit,
    isBreakeven,
    profitMarginPercent,
    markupPercent,
  };
}
