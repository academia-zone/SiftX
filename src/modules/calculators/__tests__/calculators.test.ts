import { describe, it, expect } from 'vitest';

import { evaluateExpression, tokenize } from '../engines/mathParser';
import { calculateAge, isLeapYear } from '../engines/ageDateEngine';
import { calculatePercentageChange, calculateWhatPercent, calculatePercentageOf } from '../engines/percentageEngine';
import { calculateLoan } from '../engines/loanEngine';
import { calculateElectricityBill } from '../engines/electricityEngine';
import { calculateSemesterGpa, calculateCumulativeGpa } from '../engines/gpaEngine';
import { calculateDiscount } from '../engines/discountEngine';
import { calculateBmiMetric, calculateBmiImperial } from '../engines/bmiEngine';
import { calculateGstExclusive, calculateGstInclusive } from '../engines/gstEngine';
import { calculateProfitLoss } from '../engines/profitLossEngine';
import { convertUnits } from '../engines/unitConverterEngine';
import { convertCurrency } from '../engines/currencyEngine';

describe('Calculators Engine Verification', () => {
  // 1. Math Parser & Scientific Calculator (CALC-BUG-002)
  describe('Scientific Math Parser (Deterministic, No Function())', () => {
    it('evaluates basic arithmetic respecting operator precedence', () => {
      const res = evaluateExpression('3 + 5 * 2');
      expect(res.value).toBe(13);
      expect(res.error).toBeUndefined();
    });

    it('evaluates parentheses correctly', () => {
      const res = evaluateExpression('(3 + 5) * 2');
      expect(res.value).toBe(16);
    });

    it('handles unary minus properly', () => {
      const res = evaluateExpression('-5 + 10');
      expect(res.value).toBe(5);
    });

    it('handles power operator ^', () => {
      const res = evaluateExpression('2 ^ 3');
      expect(res.value).toBe(8);
    });

    it('handles division by zero gracefully with explicit error', () => {
      const res = evaluateExpression('10 / 0');
      expect(res.error).toBe('Division by zero is undefined');
    });

    it('evaluates scientific functions: sqrt, log, sin, cos', () => {
      const sqrtRes = evaluateExpression('sqrt(16)');
      expect(sqrtRes.value).toBe(4);

      const logRes = evaluateExpression('log(100)');
      expect(logRes.value).toBe(2);

      const degSinRes = evaluateExpression('sin(90)', true); // in degree mode
      expect(Math.round(degSinRes.value)).toBe(1);
    });
  });

  // 2. Age & Date Engine (CALC-BUG-001)
  describe('Age & Date Difference (Leap Year and Month-End Borrowing)', () => {
    it('accurately calculates age on standard anniversary', () => {
      const res = calculateAge('2000-01-01', '2025-01-01');
      expect(res.years).toBe(25);
      expect(res.months).toBe(0);
      expect(res.days).toBe(0);
    });

    it('solves leap year Feb 29 to next year Feb 28 correctly', () => {
      // 2024 is leap year, 2025 is not
      const res = calculateAge('2024-02-29', '2025-02-28');
      expect(res.years).toBe(0);
      expect(res.months).toBe(11);
      expect(res.days).toBe(30);
      expect(res.totalDays).toBe(365);
    });

    it('handles month end day borrowing without negative values', () => {
      const res = calculateAge('2020-03-31', '2020-04-30');
      expect(res.months).toBe(0);
      expect(res.days).toBe(30);
    });

    it('identifies leap years accurately', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(1900)).toBe(false);
    });
  });

  // 3. Percentage Engine (CALC-BUG-003)
  describe('Percentage Engine (Handles Zero Base Safely)', () => {
    it('calculates percentage of total', () => {
      const res = calculatePercentageOf(20, 500);
      expect(res.value).toBe(100);
    });

    it('calculates what percent part is of whole', () => {
      const res = calculateWhatPercent(25, 100);
      expect(res.percentage).toBe(25);
      expect(res.isUndefined).toBe(false);
    });

    it('returns isUndefined when whole is 0', () => {
      const res = calculateWhatPercent(25, 0);
      expect(res.isUndefined).toBe(true);
    });

    it('solves percentage change from 0 base without returning misleading 0%', () => {
      const res = calculatePercentageChange(0, 100);
      expect(res.isUndefined).toBe(true);
      expect(res.direction).toBe('undefined');
    });

    it('calculates valid percentage change accurately', () => {
      const res = calculatePercentageChange(50, 75);
      expect(res.changePercent).toBe(50);
      expect(res.direction).toBe('increase');
    });
  });

  // 4. Loan & Mortgage
  describe('Loan Amortization Engine', () => {
    it('calculates standard monthly payment (EMI)', () => {
      const res = calculateLoan(100000, 6, 30);
      expect(Math.abs(res.monthlyPayment - 599.55)).toBeLessThan(0.1);
      expect(res.totalPayment).toBeGreaterThan(200000);
    });
  });

  // 5. Electricity Bill
  describe('Electricity Bill NEPRA Engine', () => {
    it('calculates protected consumer under 50 units', () => {
      const res = calculateElectricityBill(40, 'protected');
      expect(res.totalEstimatedBill).toBeGreaterThan(0);
      expect(res.units).toBe(40);
    });

    it('calculates unprotected tier accurately', () => {
      const res = calculateElectricityBill(350, 'unprotected');
      expect(res.totalEstimatedBill).toBeGreaterThan(5000);
    });
  });

  // 6. GPA / CGPA
  describe('GPA & CGPA Engine', () => {
    it('calculates semester GPA from course grades', () => {
      const courses = [
        { id: '1', name: 'CS101', grade: 'A', creditHours: 3 },
        { id: '2', name: 'MATH', grade: 'B', creditHours: 3 },
      ];
      const res = calculateSemesterGpa(courses);
      expect(res.gpa).toBe(3.5);
      expect(res.totalCredits).toBe(6);
    });
  });

  // 7. Discount Engine
  describe('Discount Engine', () => {
    it('calculates discount and sales tax payable', () => {
      const res = calculateDiscount(1000, 20, 5);
      expect(res.discountAmount).toBe(200);
      expect(res.finalPrice).toBe(800);
      expect(res.totalPayable).toBe(840);
    });
  });

  // 8. BMI Engine
  describe('BMI Health Engine', () => {
    it('calculates normal BMI metric (70kg, 175cm)', () => {
      const res = calculateBmiMetric(70, 175);
      expect(res.bmi).toBe(22.9);
      expect(res.category).toBe('Normal Weight');
    });
  });

  // 9. GST Engine
  describe('GST Engine', () => {
    it('calculates exclusive GST', () => {
      const res = calculateGstExclusive(1000, 18);
      expect(res.taxAmount).toBe(180);
      expect(res.totalAmount).toBe(1180);
    });

    it('calculates inclusive GST', () => {
      const res = calculateGstInclusive(1180, 18);
      expect(res.baseAmount).toBe(1000);
      expect(res.taxAmount).toBe(180);
    });
  });

  // 10. Profit & Loss Engine
  describe('Profit & Loss Engine', () => {
    it('calculates profit margin and markup', () => {
      const res = calculateProfitLoss(80, 100);
      expect(res.profitOrLossAmount).toBe(20);
      expect(res.isProfit).toBe(true);
      expect(res.profitMarginPercent).toBe(20);
      expect(res.markupPercent).toBe(25);
    });
  });

  // 11. Unit Converter Engine
  describe('Unit Converter Engine', () => {
    it('converts meters to kilometers', () => {
      const res = convertUnits(5000, 'length', 'm', 'km');
      expect(res.result).toBe(5);
    });

    it('distinguishes digital decimal GB from binary GiB', () => {
      const decRes = convertUnits(1, 'digital', 'GB', 'MB');
      expect(decRes.result).toBe(1000);

      const binRes = convertUnits(1, 'digital', 'GiB', 'MiB');
      expect(binRes.result).toBe(1024);
    });
  });

  // 12. Currency Engine
  describe('Currency Engine', () => {
    it('converts USD to PKR using benchmark baseline', () => {
      const res = convertCurrency(100, 'USD', 'PKR');
      expect(res.convertedAmount).toBe(27850);
      expect(res.disclaimer.length).toBeGreaterThan(0);
    });
  });
});
