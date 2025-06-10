import './style.css';
import { BAC_INFORMATIQUE_SUBJECTS, TOTAL_COEFFICIENTS } from './data/subjects';
import { calculateAverage, validateGrade, getGradeStatus } from './utils/calculations';
import { saveGrades, loadGrades, clearGrades } from './utils/storage';
import { GradeData, CalculationResult } from './types';

class BacCalculator {
  private grades: GradeData = {};
  private app: HTMLElement;

  constructor() {
    this.app = document.querySelector<HTMLDivElement>('#app')!;
    this.grades = loadGrades();
    this.init();
  }

  private init(): void {
    this.render();
    this.attachEventListeners();
    this.updateResults();
  }

  private render(): void {
    this.app.innerHTML = `
      <div class="container">
        <header class="header">
          <h1>🎓 Calculateur Moyenne Bac Informatique</h1>
          <p>Calculez votre moyenne du baccalauréat informatique tunisien</p>
        </header>

        <div class="card">
          <h2>📚 Notes par matière</h2>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill"></div>
          </div>
          <div class="subjects-grid" id="subjects-grid">
            ${this.renderSubjects()}
          </div>
        </div>

        <div class="card results-card" id="results-card">
          <h2>📊 Résultats</h2>
          <div id="results-content">
            ${this.renderResults()}
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-secondary" id="clear-btn">🗑️ Effacer tout</button>
          <button class="btn btn-primary" id="save-btn">💾 Sauvegarder</button>
        </div>
      </div>
    `;
  }

  private renderSubjects(): string {
    return BAC_INFORMATIQUE_SUBJECTS.map(subject => `
      <div class="subject-item">
        <div class="subject-info">
          <div class="subject-name">${subject.name}</div>
          <div class="subject-coefficient">Coefficient: ${subject.coefficient}</div>
        </div>
        <input 
          type="number" 
          class="grade-input" 
          id="grade-${subject.id}"
          placeholder="0-20"
          min="0" 
          max="20" 
          step="0.25"
          value="${this.grades[subject.id] || ''}"
        />
      </div>
    `).join('');
  }

  private renderResults(): string {
    const result = calculateAverage(BAC_INFORMATIQUE_SUBJECTS, this.grades);
    
    if (result.totalCoefficients === 0) {
      return `
        <p style="color: var(--text-secondary); font-size: 1.1rem;">
          Entrez vos notes pour voir votre moyenne
        </p>
      `;
    }

    const status = getGradeStatus(result.average);
    const completedSubjects = Object.keys(this.grades).filter(key => 
      this.grades[key] !== undefined && this.grades[key] !== null && !isNaN(this.grades[key])
    ).length;

    return `
      <div class="average-display" style="color: ${status.color}">
        ${result.average.toFixed(2)}/20
      </div>
      
      <div class="status-message" style="color: ${status.color}">
        ${status.message}
      </div>

      <div class="calculation-details">
        <div class="detail-item">
          <div class="detail-value">${completedSubjects}</div>
          <div class="detail-label">Matières saisies</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${BAC_INFORMATIQUE_SUBJECTS.length}</div>
          <div class="detail-label">Total matières</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${result.totalPoints.toFixed(1)}</div>
          <div class="detail-label">Points obtenus</div>
        </div>
        <div class="detail-item">
          <div class="detail-value">${result.totalCoefficients}</div>
          <div class="detail-label">Coefficients</div>
        </div>
      </div>

      ${!result.isComplete ? `
        <p style="color: var(--warning-color); font-weight: 600;">
          ⚠️ Moyenne partielle - ${BAC_INFORMATIQUE_SUBJECTS.length - completedSubjects} matière(s) manquante(s)
        </p>
      ` : `
        <p style="color: var(--success-color); font-weight: 600;">
          ✅ Toutes les matières sont saisies !
        </p>
      `}
    `;
  }

  private attachEventListeners(): void {
    // Grade input listeners
    BAC_INFORMATIQUE_SUBJECTS.forEach(subject => {
      const input = document.getElementById(`grade-${subject.id}`) as HTMLInputElement;
      if (input) {
        input.addEventListener('input', (e) => this.handleGradeInput(e, subject.id));
        input.addEventListener('blur', (e) => this.handleGradeBlur(e, subject.id));
      }
    });

    // Action button listeners
    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');

    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearAllGrades());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveGrades());
    }
  }

  private handleGradeInput(event: Event, subjectId: string): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    
    if (value === '') {
      delete this.grades[subjectId];
      input.classList.remove('invalid');
    } else {
      const validatedGrade = validateGrade(value);
      if (validatedGrade !== null) {
        this.grades[subjectId] = validatedGrade;
        input.classList.remove('invalid');
      } else {
        input.classList.add('invalid');
      }
    }
    
    this.updateResults();
    this.updateProgress();
  }

  private handleGradeBlur(event: Event, subjectId: string): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    
    if (value !== '' && validateGrade(value) === null) {
      input.value = '';
      delete this.grades[subjectId];
      input.classList.remove('invalid');
      this.updateResults();
      this.updateProgress();
    }
  }

  private updateResults(): void {
    const resultsContent = document.getElementById('results-content');
    if (resultsContent) {
      resultsContent.innerHTML = this.renderResults();
    }
  }

  private updateProgress(): void {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
      const completedSubjects = Object.keys(this.grades).filter(key => 
        this.grades[key] !== undefined && this.grades[key] !== null && !isNaN(this.grades[key])
      ).length;
      const percentage = (completedSubjects / BAC_INFORMATIQUE_SUBJECTS.length) * 100;
      progressFill.style.width = `${percentage}%`;
    }
  }

  private clearAllGrades(): void {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les notes ?')) {
      this.grades = {};
      clearGrades();
      
      // Clear all input fields
      BAC_INFORMATIQUE_SUBJECTS.forEach(subject => {
        const input = document.getElementById(`grade-${subject.id}`) as HTMLInputElement;
        if (input) {
          input.value = '';
          input.classList.remove('invalid');
        }
      });
      
      this.updateResults();
      this.updateProgress();
    }
  }

  private saveGrades(): void {
    saveGrades(this.grades);
    
    // Show temporary success message
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '✅ Sauvegardé !';
      saveBtn.style.backgroundColor = 'var(--success-color)';
      
      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.backgroundColor = '';
      }, 2000);
    }
  }
}

// Initialize the application
new BacCalculator();
