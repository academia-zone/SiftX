/**
 * Discount, Shopping & Savings Calculation Engine
 */

export interface DiscountResult {
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  additionalTaxAmount: number;
  totalPayable: number;
}

export function calculateDiscount(
  originalPrice: number,
  discountPercentage: number,
  taxPercentage: number = 0
): DiscountResult {
  const safePrice = Math.max(0, originalPrice);
  const safeDiscount = Math.min(100, Math.max(0, discountPercentage));
  const safeTax = Math.max(0, taxPercentage);

  const discountAmount = (safeDiscount / 100) * safePrice;
  const discountedPrice = safePrice - discountAmount;
  const additionalTaxAmount = (safeTax / 100) * discountedPrice;
  const totalPayable = discountedPrice + additionalTaxAmount;

  return {
    originalPrice: safePrice,
    discountPercentage: safeDiscount,
    discountAmount: Number(discountAmount.toFixed(2)),
    finalPrice: Number(discountedPrice.toFixed(2)),
    additionalTaxAmount: Number(additionalTaxAmount.toFixed(2)),
    totalPayable: Number(totalPayable.toFixed(2)),
  };
}
