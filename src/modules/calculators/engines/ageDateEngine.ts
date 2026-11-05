/**
 * Precise Age & Date Difference Engine
 * Solves CALC-BUG-001: Correctly handles leap years (Feb 29), month-end borrowing,
 * anniversaries, and total elapsed day/hour counts.
 */

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  isLeapYearBirth: boolean;
  nextBirthdayDays: number;
  error?: string;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

/**
 * Calculates calendar age between birthDate and targetDate
 */
export function calculateAge(birthDateStr: string, targetDateStr: string = new Date().toISOString().split('T')[0]): AgeResult {
  const birth = new Date(birthDateStr + 'T00:00:00');
  const target = new Date(targetDateStr + 'T00:00:00');

  if (isNaN(birth.getTime()) || isNaN(target.getTime())) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      totalWeeks: 0,
      totalHours: 0,
      isLeapYearBirth: false,
      nextBirthdayDays: 0,
      error: 'Invalid date supplied',
    };
  }

  if (birth.getTime() > target.getTime()) {
    return {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
      totalWeeks: 0,
      totalHours: 0,
      isLeapYearBirth: isLeapYear(birth.getFullYear()),
      nextBirthdayDays: 0,
      error: 'Birth date cannot be after the target date',
    };
  }

  const birthYear = birth.getFullYear();
  const birthMonth = birth.getMonth();
  const birthDay = birth.getDate();

  const targetYear = target.getFullYear();
  const targetMonth = target.getMonth();
  const targetDay = target.getDate();

  let years = targetYear - birthYear;
  let months = targetMonth - birthMonth;
  let days = targetDay - birthDay;

  if (days < 0) {
    // Borrow days from the previous month of the target date
    const prevMonthYear = targetMonth === 0 ? targetYear - 1 : targetYear;
    const prevMonthIndex = targetMonth === 0 ? 11 : targetMonth - 1;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);

    days += daysInPrevMonth;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  // Exact total days elapsed (taking full timezone-safe difference)
  const diffMs = target.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  const isLeapBirth = isLeapYear(birthYear) && birthMonth === 1 && birthDay === 29;

  // Next Birthday Calculation
  let nextBdayYear = targetYear;
  let nextBdayDay = birthDay;
  if (isLeapBirth && !isLeapYear(nextBdayYear)) {
    // If born on Feb 29 and next year is not a leap year, standard anniversary is Feb 28
    nextBdayDay = 28;
  }
  let nextBday = new Date(nextBdayYear, birthMonth, nextBdayDay);
  if (nextBday.getTime() < target.getTime()) {
    nextBdayYear += 1;
    nextBdayDay = birthDay;
    if (isLeapBirth && !isLeapYear(nextBdayYear)) {
      nextBdayDay = 28;
    }
    nextBday = new Date(nextBdayYear, birthMonth, nextBdayDay);
  }

  const nextBdayDiffMs = nextBday.getTime() - target.getTime();
  const nextBirthdayDays = Math.round(nextBdayDiffMs / (1000 * 60 * 60 * 24));

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    isLeapYearBirth: isLeapBirth,
    nextBirthdayDays,
  };
}
