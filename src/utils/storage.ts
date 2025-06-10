import { GradeData } from '../types';

const STORAGE_KEY = 'bac_informatique_grades';

export function saveGrades(grades: GradeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grades));
  } catch (error) {
    console.warn('Could not save grades to localStorage:', error);
  }
}

export function loadGrades(): GradeData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn('Could not load grades from localStorage:', error);
    return {};
  }
}

export function clearGrades(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Could not clear grades from localStorage:', error);
  }
}
