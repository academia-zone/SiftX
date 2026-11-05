/**
 * GPA & CGPA Academic Calculation Engine
 * 4.0 Grading Scale standard (HEC / International standard)
 */

export interface CourseEntry {
  id: string;
  name: string;
  grade: string;
  creditHours: number;
}

export const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'F': 0.0,
};

export function calculateSemesterGpa(courses: CourseEntry[]): { gpa: number; totalCredits: number; totalQualityPoints: number } {
  let totalCredits = 0;
  let totalQualityPoints = 0;

  for (const course of courses) {
    const credits = Math.max(0, course.creditHours);
    const pts = GRADE_POINTS[course.grade.toUpperCase()] ?? 0;
    totalCredits += credits;
    totalQualityPoints += pts * credits;
  }

  const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  return {
    gpa: Number(gpa.toFixed(2)),
    totalCredits,
    totalQualityPoints: Number(totalQualityPoints.toFixed(2)),
  };
}

export function calculateCumulativeGpa(
  previousCgpa: number,
  previousCredits: number,
  currentGpa: number,
  currentCredits: number
): { cgpa: number; totalCredits: number } {
  const totalCredits = previousCredits + currentCredits;
  if (totalCredits === 0) return { cgpa: 0, totalCredits: 0 };

  const totalPoints = (previousCgpa * previousCredits) + (currentGpa * currentCredits);
  const cgpa = totalPoints / totalCredits;

  return {
    cgpa: Number(cgpa.toFixed(2)),
    totalCredits,
  };
}
