export type CalculatorToolId = 
  | 'electricity-bill'
  | 'gpa-cgpa'
  | 'loan-mortgage'
  | 'scientific'
  | 'percentage'
  | 'age-date'
  | 'discount'
  | 'bmi'
  | 'gst-tax'
  | 'profit-loss'
  | 'unit-converter'
  | 'currency';

export interface CalculatorMeta {
  id: CalculatorToolId;
  name: string;
  category: 'Everyday' | 'Financial' | 'Academic & Math';
  tagline: string;
  iconName: string;
  badge?: string;
  description: string;
}

export const CALCULATOR_TOOLS: CalculatorMeta[] = [
  {
    id: 'electricity-bill',
    name: 'Electricity Bill (Pakistan 2026)',
    category: 'Everyday',
    tagline: 'IESCO, LESCO, KE, MEPCO official tariff slabs with FPA & taxes',
    iconName: 'Zap',
    badge: 'Official 2026',
    description: 'Calculates exact residential electricity bill based on units (kWh), protected vs unprotected slabs, FPA, and government taxes.',
  },
  {
    id: 'gpa-cgpa',
    name: 'GPA & CGPA Calculator',
    category: 'Academic & Math',
    tagline: 'Semester GPA, cumulative CGPA & honors forecasting on 4.0 scale',
    iconName: 'GraduationCap',
    badge: '4.0 Scale',
    description: 'Calculate weighted semester GPA and overall cumulative CGPA with customizable credit hours and letter grade points.',
  },
  {
    id: 'loan-mortgage',
    name: 'Loan & Mortgage EMI Calculator',
    category: 'Financial',
    tagline: 'Monthly EMI installment, total interest & amortization breakdown',
    iconName: 'Landmark',
    badge: 'Financial',
    description: 'Computes monthly payment, principal vs interest distribution, and loan payoff timeline for car, personal, and home loans.',
  },
  {
    id: 'scientific',
    name: 'Scientific Calculator',
    category: 'Academic & Math',
    tagline: 'Trigonometry, logarithms, exponents, radians & calculation history',
    iconName: 'Calculator',
    badge: 'Scientific',
    description: 'Full-featured scientific computation engine with history tape, bracket grouping, and angle mode toggles.',
  },
  {
    id: 'percentage',
    name: 'Percentage Calculator',
    category: 'Everyday',
    tagline: 'Calculate % increase, decrease, margins, markups & ratios',
    iconName: 'Percent',
    description: 'Solves all common percentage problems instantly with visual breakdown formulas.',
  },
  {
    id: 'age-date',
    name: 'Age & Date Difference Calculator',
    category: 'Everyday',
    tagline: 'Exact age in years, months, days, minutes & birthday countdown',
    iconName: 'Calendar',
    description: 'Computes exact chronological age, calendar date intervals, and remaining days until milestone anniversaries.',
  },
  {
    id: 'discount',
    name: 'Discount & Shopping Calculator',
    category: 'Everyday',
    tagline: 'Sale prices, double discounts (e.g. 20% + 10%) & net savings',
    iconName: 'Tag',
    description: 'Quickly find how much you save on clearance sales, coupons, and promotional discounts.',
  },
  {
    id: 'bmi',
    name: 'BMI Health Calculator',
    category: 'Everyday',
    tagline: 'Body Mass Index with healthy weight range & classification',
    iconName: 'HeartPulse',
    badge: 'Health',
    description: 'Calculates BMI using metric (cm/kg) or imperial (ft/lbs) measurements with WHO classification charts.',
  },
  {
    id: 'gst-tax',
    name: 'GST & Sales Tax Calculator',
    category: 'Financial',
    tagline: 'Add or remove GST with standard (18%, 17%, 5%) and custom rates',
    iconName: 'Receipt',
    description: 'Breaks down net price, tax amount, and gross total for inclusive and exclusive sales tax rates.',
  },
  {
    id: 'profit-loss',
    name: 'Profit & Loss Calculator',
    category: 'Financial',
    tagline: 'Cost price, revenue, gross profit, margin % & markup %',
    iconName: 'TrendingUp',
    description: 'Essential business calculator for merchants, eCommerce sellers, and wholesale pricing.',
  },
  {
    id: 'unit-converter',
    name: 'Universal Unit Converter',
    category: 'Academic & Math',
    tagline: 'Length, weight, temperature, speed, area, and digital data storage',
    iconName: 'Scale',
    description: 'Instant two-way unit conversion across metric, imperial, and SI standards.',
  },
  {
    id: 'currency',
    name: 'Currency Converter',
    category: 'Financial',
    tagline: 'USD, PKR, EUR, GBP, AED, SAR live conversion estimator',
    iconName: 'DollarSign',
    description: 'Calculates foreign currency conversions with easy reciprocal flipping and denomination table.',
  },
];
