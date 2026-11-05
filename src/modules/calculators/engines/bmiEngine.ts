/**
 * Body Mass Index (BMI) & Healthy Weight Range Engine
 * Formula:
 * Metric: BMI = weight (kg) / (height (m))^2
 * Imperial: BMI = 703 * weight (lbs) / (height (in))^2
 * Categories standard: World Health Organization (WHO)
 */

export interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal Weight' | 'Overweight' | 'Obese Class I' | 'Obese Class II' | 'Severe Obesity';
  healthyWeightMinKg: number;
  healthyWeightMaxKg: number;
  healthyWeightMinLbs: number;
  healthyWeightMaxLbs: number;
  colorClass: string;
}

export function calculateBmiMetric(weightKg: number, heightCm: number): BmiResult {
  if (weightKg <= 0 || heightCm <= 0) {
    return {
      bmi: 0,
      category: 'Normal Weight',
      healthyWeightMinKg: 0,
      healthyWeightMaxKg: 0,
      healthyWeightMinLbs: 0,
      healthyWeightMaxLbs: 0,
      colorClass: 'text-slate-400',
    };
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  return classifyBmi(bmi, heightM);
}

export function calculateBmiImperial(weightLbs: number, heightFeet: number, heightInches: number): BmiResult {
  const totalInches = heightFeet * 12 + heightInches;
  if (weightLbs <= 0 || totalInches <= 0) {
    return {
      bmi: 0,
      category: 'Normal Weight',
      healthyWeightMinKg: 0,
      healthyWeightMaxKg: 0,
      healthyWeightMinLbs: 0,
      healthyWeightMaxLbs: 0,
      colorClass: 'text-slate-400',
    };
  }

  const heightM = (totalInches * 2.54) / 100;
  const bmi = (703 * weightLbs) / (totalInches * totalInches);

  return classifyBmi(bmi, heightM);
}

function classifyBmi(bmi: number, heightM: number): BmiResult {
  const roundedBmi = Number(bmi.toFixed(1));
  let category: BmiResult['category'] = 'Normal Weight';
  let colorClass = 'text-emerald-600';

  if (roundedBmi < 18.5) {
    category = 'Underweight';
    colorClass = 'text-amber-500';
  } else if (roundedBmi < 25) {
    category = 'Normal Weight';
    colorClass = 'text-emerald-600';
  } else if (roundedBmi < 30) {
    category = 'Overweight';
    colorClass = 'text-orange-500';
  } else if (roundedBmi < 35) {
    category = 'Obese Class I';
    colorClass = 'text-rose-500';
  } else if (roundedBmi < 40) {
    category = 'Obese Class II';
    colorClass = 'text-rose-600';
  } else {
    category = 'Severe Obesity';
    colorClass = 'text-rose-700';
  }

  // WHO Healthy BMI range is 18.5 - 24.9
  const healthyWeightMinKg = Number((18.5 * heightM * heightM).toFixed(1));
  const healthyWeightMaxKg = Number((24.9 * heightM * heightM).toFixed(1));

  return {
    bmi: roundedBmi,
    category,
    healthyWeightMinKg,
    healthyWeightMaxKg,
    healthyWeightMinLbs: Number((healthyWeightMinKg * 2.20462).toFixed(1)),
    healthyWeightMaxLbs: Number((healthyWeightMaxKg * 2.20462).toFixed(1)),
    colorClass,
  };
}
