export interface Subject {
  id: string;
  name: string;
  coefficient: number;
  grade?: number;
  required?: boolean;
  minGrade?: number;
}

export interface CalculationResult {
  average: number;
  totalPoints: number;
  totalCoefficients: number;
  isComplete: boolean;
}

export interface GradeData {
  [subjectId: string]: number;
}
