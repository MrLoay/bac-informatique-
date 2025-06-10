import { Subject, CalculationResult, GradeData } from '../types';

export function calculateAverage(subjects: Subject[], grades: GradeData): CalculationResult {
  let totalPoints = 0;
  let totalCoefficients = 0;
  let enteredGrades = 0;

  subjects.forEach(subject => {
    const grade = grades[subject.id];
    if (grade !== undefined && grade !== null && !isNaN(grade)) {
      totalPoints += grade * subject.coefficient;
      totalCoefficients += subject.coefficient;
      enteredGrades++;
    }
  });

  const average = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
  const isComplete = enteredGrades === subjects.length;

  return {
    average: Math.round(average * 100) / 100, // Round to 2 decimal places
    totalPoints,
    totalCoefficients,
    isComplete
  };
}

export function validateGrade(grade: string): number | null {
  const numGrade = parseFloat(grade);
  if (isNaN(numGrade) || numGrade < 0 || numGrade > 20) {
    return null;
  }
  return numGrade;
}

export function getGradeStatus(average: number): { status: string; color: string; message: string } {
  if (average >= 16) {
    return {
      status: 'excellent',
      color: '#22c55e',
      message: 'Excellent ! Très bien réussi !'
    };
  } else if (average >= 14) {
    return {
      status: 'good',
      color: '#3b82f6',
      message: 'Bien ! Bon travail !'
    };
  } else if (average >= 12) {
    return {
      status: 'satisfactory',
      color: '#f59e0b',
      message: 'Assez bien ! Continue tes efforts !'
    };
  } else if (average >= 10) {
    return {
      status: 'passing',
      color: '#f97316',
      message: 'Passable ! Tu peux faire mieux !'
    };
  } else {
    return {
      status: 'failing',
      color: '#ef4444',
      message: 'Insuffisant ! Il faut travailler davantage !'
    };
  }
}
