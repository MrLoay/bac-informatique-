import { Subject } from '../types';

export const BAC_INFORMATIQUE_SUBJECTS: Subject[] = [
  {
    id: 'math',
    name: 'Mathématiques',
    coefficient: 3,
    required: true
  },
  {
    id: 'sciences_physiques',
    name: 'Sciences Physiques',
    coefficient: 2,
    required: true
  },
  {
    id: 'programmation',
    name: 'Programmation',
    coefficient: 3,
    required: true
  },
  {
    id: 'sti',
    name: 'STI',
    coefficient: 3,
    required: true
  },
  {
    id: 'francais',
    name: 'Français',
    coefficient: 1,
    required: true
  },
  {
    id: 'arabe',
    name: 'Arabe',
    coefficient: 1,
    required: true
  },
  {
    id: 'anglais',
    name: 'Anglais',
    coefficient: 1,
    required: true
  },
  {
    id: 'philosophie',
    name: 'Philosophie',
    coefficient: 1,
    required: true
  },
  {
    id: 'sport',
    name: 'Sport (Contrôle Continu)',
    coefficient: 1,
    required: true
  },
  {
    id: 'allemand',
    name: 'Allemand',
    coefficient: 1,
    required: false,
    minGrade: 10
  }
];

export const TOTAL_COEFFICIENTS = BAC_INFORMATIQUE_SUBJECTS.reduce(
  (sum, subject) => sum + subject.coefficient, 
  0
);
