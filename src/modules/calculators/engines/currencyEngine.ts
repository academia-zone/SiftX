/**
 * Indicative Currency Conversion Engine
 * Benchmark baseline pegged to central bank references (USD, PKR, EUR, GBP, AED, SAR, INR, CAD).
 */

export interface CurrencyConversionResult {
  fromAmount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  convertedAmount: number;
  effectiveDate: string;
  disclaimer: string;
}

// Benchmark Rates (Base: 1 USD)
export const BENCHMARK_USD_RATES: Record<string, number> = {
  USD: 1.0,
  PKR: 278.50,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SAR: 3.75,
  INR: 83.45,
  CAD: 1.36,
  AUD: 1.52,
  CNY: 7.23,
  JPY: 154.20,
};

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): CurrencyConversionResult {
  const safeAmount = Math.max(0, amount);
  const fromRate = BENCHMARK_USD_RATES[fromCurrency] || 1.0;
  const toRate = BENCHMARK_USD_RATES[toCurrency] || 1.0;

  // Convert to USD base first, then to target currency
  const inUsd = safeAmount / fromRate;
  const converted = inUsd * toRate;
  const exchangeRate = toRate / fromRate;

  return {
    fromAmount: safeAmount,
    fromCurrency,
    toCurrency,
    rate: Number(exchangeRate.toFixed(4)),
    convertedAmount: Number(converted.toFixed(2)),
    effectiveDate: 'Indicative Reference Benchmark (Updated 2026)',
    disclaimer: 'Exchange rates are indicative benchmarks for planning purposes. Commercial bank teller rates and credit card spreads may vary.',
  };
}
