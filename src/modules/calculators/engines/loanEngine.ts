/**
 * Loan & Mortgage Financial Calculation Engine
 * Implements Standard Amortization Formula:
 * EMI = [P * r * (1 + r)^n] / [(1 + r)^n - 1]
 */

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationRow[];
  error?: string;
}

export function calculateLoan(
  principal: number,
  annualRatePct: number,
  tenureYears: number,
  generateSchedule: boolean = false
): LoanResult {
  if (principal <= 0 || tenureYears <= 0) {
    return {
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      schedule: [],
      error: 'Principal and tenure must be greater than zero',
    };
  }

  const n = tenureYears * 12; // Total months
  const r = (annualRatePct / 100) / 12; // Monthly interest rate

  if (r === 0) {
    const monthlyPayment = principal / n;
    return {
      monthlyPayment: Number(monthlyPayment.toFixed(2)),
      totalPayment: Number(principal.toFixed(2)),
      totalInterest: 0,
      schedule: [],
    };
  }

  const factor = Math.pow(1 + r, n);
  const monthlyPayment = (principal * r * factor) / (factor - 1);
  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - principal;

  const schedule: AmortizationRow[] = [];
  if (generateSchedule) {
    let balance = principal;
    for (let month = 1; month <= n; month++) {
      const interest = balance * r;
      const principalPaid = monthlyPayment - interest;
      balance = Math.max(0, balance - principalPaid);

      schedule.push({
        month,
        payment: Number(monthlyPayment.toFixed(2)),
        principal: Number(principalPaid.toFixed(2)),
        interest: Number(interest.toFixed(2)),
        balance: Number(balance.toFixed(2)),
      });
    }
  }

  return {
    monthlyPayment: Number(monthlyPayment.toFixed(2)),
    totalPayment: Number(totalPayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    schedule,
  };
}
