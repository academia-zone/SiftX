/**
 * Percentage Calculation Engine
 * Solves CALC-BUG-003: Accurately handles division by zero when calculating percentage changes.
 */

export interface PercentageOfResult {
  value: number;
}

export interface WhatPercentResult {
  percentage: number;
  isUndefined: boolean;
  message?: string;
}

export interface PercentageChangeResult {
  changePercent: number;
  difference: number;
  direction: 'increase' | 'decrease' | 'unchanged' | 'undefined';
  isUndefined: boolean;
  message?: string;
}

export interface PercentageAddSubtractResult {
  result: number;
  delta: number;
}

export function calculatePercentageOf(percentage: number, total: number): PercentageOfResult {
  return {
    value: Number(((percentage / 100) * total).toFixed(4)),
  };
}

export function calculateWhatPercent(part: number, whole: number): WhatPercentResult {
  if (whole === 0) {
    return {
      percentage: 0,
      isUndefined: true,
      message: 'Cannot calculate percentage of whole = 0 (undefined)',
    };
  }
  return {
    percentage: Number(((part / whole) * 100).toFixed(4)),
    isUndefined: false,
  };
}

export function calculatePercentageChange(initialVal: number, finalVal: number): PercentageChangeResult {
  const diff = finalVal - initialVal;

  if (initialVal === 0) {
    if (finalVal === 0) {
      return {
        changePercent: 0,
        difference: 0,
        direction: 'unchanged',
        isUndefined: false,
        message: 'No change (0 to 0 is 0%)',
      };
    }
    // Mathematically undefined to calculate percentage change from zero base
    return {
      changePercent: 0,
      difference: diff,
      direction: 'undefined',
      isUndefined: true,
      message: 'Percentage change from 0 is mathematically undefined (division by zero)',
    };
  }

  const changePercent = (diff / Math.abs(initialVal)) * 100;
  const direction = diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'unchanged';

  return {
    changePercent: Number(changePercent.toFixed(4)),
    difference: Number(diff.toFixed(4)),
    direction,
    isUndefined: false,
  };
}

export function calculateAddSubtractPercentage(base: number, percent: number, isAddition: boolean): PercentageAddSubtractResult {
  const delta = (percent / 100) * base;
  const result = isAddition ? base + delta : base - delta;
  return {
    result: Number(result.toFixed(4)),
    delta: Number(delta.toFixed(4)),
  };
}
