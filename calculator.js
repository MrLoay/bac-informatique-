// Subjects data for bac informatique
const subjects = [
    { id: 'math', name: 'Mathématiques', coefficient: 3, required: true },
    { id: 'sciences_physiques', name: 'Sciences Physiques', coefficient: 2, required: true },
    { id: 'programmation', name: 'Programmation', coefficient: 3, required: true },
    { id: 'sti', name: 'STI', coefficient: 3, required: true },
    { id: 'francais', name: 'Français', coefficient: 1, required: true },
    { id: 'arabe', name: 'Arabe', coefficient: 1, required: true },
    { id: 'anglais', name: 'Anglais', coefficient: 1, required: true },
    { id: 'philosophie', name: 'Philosophie', coefficient: 1, required: true },
    { id: 'sport', name: 'Sport (Contrôle Continu)', coefficient: 1, required: true, note: 'Évaluation pratique - pas d\'examen écrit' },
    { id: 'allemand', name: 'Allemand', coefficient: 1, required: false, minGrade: 10 }
];

let grades = {};

// Load grades from localStorage
function loadGrades() {
    try {
        const saved = localStorage.getItem('bac_informatique_grades');
        return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.warn('Could not load grades from localStorage:', error);
        return {};
    }
}

// Save grades to localStorage
function saveGrades() {
    try {
        localStorage.setItem('bac_informatique_grades', JSON.stringify(grades));
    } catch (error) {
        console.warn('Could not save grades to localStorage:', error);
    }
}

// Validate grade input
function validateGrade(grade) {
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > 20) {
        return null;
    }
    return numGrade;
}

// Calculate average and score
function calculateAverage() {
    let totalPoints = 0;
    let totalCoefficients = 0;
    let enteredGrades = 0;
    let requiredSubjects = subjects.filter(s => s.required).length;

    subjects.forEach(subject => {
        const grade = grades[subject.id];
        if (grade !== undefined && grade !== null && !isNaN(grade)) {
            // For optional subjects (like Allemand), only include if grade is better than minimum threshold
            // This means the grade must be STRICTLY greater than the minGrade (10)
            if (!subject.required && subject.minGrade && grade <= subject.minGrade) {
                // Don't include this grade in calculation if it's 10 or below
                return;
            }
            if (subject.id === 'allemand' && grade >= 10) {
                totalPoints+=grade-10;
                // Don't include this grade in calculation if it's 10 or below
                
            }
            else{
                totalPoints += grade * subject.coefficient;
                totalCoefficients += subject.coefficient;
                
            }

            
            enteredGrades++;
        }
    });

    const average = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
    const requiredGradesEntered = subjects.filter(s => s.required && grades[s.id] !== undefined && grades[s.id] !== null && !isNaN(grades[s.id])).length;
    const isComplete = requiredGradesEntered === requiredSubjects;

    // Calculate score (based on the formula pattern observed)
    const score = calculateScore();
    const scoreWith7Percent = score * 1.07; // 7% bonus

    return {
        average: Math.round(average * 100) / 100,
        totalPoints,
        totalCoefficients,
        isComplete,
        enteredGrades,
        requiredSubjects,
        requiredGradesEntered,
        score: Math.round(score * 100) / 100,
        scoreWith7Percent: Math.round(scoreWith7Percent * 100) / 100
    };
}

// Calculate score using a different weighting system
function calculateScore() {
    // Based on observed pattern, score seems to be total points scaled differently
    // This appears to be the same as totalPoints but displayed differently
    let scorePoints = 0;
    let maxPossiblePoints = 0;

    subjects.forEach(subject => {
        const grade = grades[subject.id];
        if (grade !== undefined && grade !== null && !isNaN(grade)) {
            // For optional subjects, only include if grade is better than minimum threshold
            // This means the grade must be STRICTLY greater than the minGrade (10)
            if (!subject.required && subject.minGrade && grade <= subject.minGrade) {
                return;
            }

            scorePoints += grade * subject.coefficient;
        }

        // Calculate max possible points for this subject
        // For optional subjects, only count max points if the grade is actually being used
        if (subject.required || (grades[subject.id] !== undefined && grades[subject.id] > (subject.minGrade || 0))) {
            maxPossiblePoints += 20 * subject.coefficient;
        }
    });

    // Score appears to be a scaled version - possibly out of 120 or similar
    // Based on the example: 171 points gives score of 96.25
    // This suggests: score = (totalPoints / maxPoints) * scaleFactor
    const scaleFactor = 120; // Adjust based on your system
    return maxPossiblePoints > 0 ? (scorePoints / maxPossiblePoints) * scaleFactor : 0;
}

// Get grade status
function getGradeStatus(average) {
    if (average >= 16) {
        return { status: 'excellent', color: '#22c55e', message: 'Excellent ! Très bien réussi !' };
    } else if (average >= 14) {
        return { status: 'good', color: '#3b82f6', message: 'Bien ! Bon travail !' };
    } else if (average >= 12) {
        return { status: 'satisfactory', color: '#f59e0b', message: 'Assez bien ! Continue tes efforts !' };
    } else if (average >= 10) {
        return { status: 'passing', color: '#f97316', message: 'Passable ! Tu peux faire mieux !' };
    } else {
        return { status: 'failing', color: '#ef4444', message: 'Insuffisant ! Il faut travailler davantage !' };
    }
}

// Render subjects
function renderSubjects() {
    console.log('Rendering subjects...');
    const grid = document.getElementById('subjects-grid');

    if (!grid) {
        console.error('subjects-grid element not found!');
        return;
    }

    console.log('Grid element found:', grid);

    const html = subjects.map(subject => {
        const isOptional = !subject.required;
        const optionalInfo = isOptional ? ` (Optionnel - compte seulement si >10)` : '';
        const optionalClass = isOptional ? ' style="opacity: 0.8; border-style: dashed;"' : '';

        return `
            <div class="subject-item"${optionalClass}>
                <div class="subject-info">
                    <div class="subject-name">${subject.name}${optionalInfo}</div>
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
                    value="${grades[subject.id] || ''}"
                />
            </div>
        `;
    }).join('');

    console.log('Generated HTML:', html);
    grid.innerHTML = html;
    console.log('Subjects rendered successfully');
}

// Update results display
function updateResults() {
    const result = calculateAverage();
    const resultsContent = document.getElementById('results-content');

    if (result.totalCoefficients === 0) {
        resultsContent.innerHTML = `
            <p style="color: var(--text-secondary); font-size: 1.1rem;">
                Entrez vos notes pour voir votre moyenne
            </p>
        `;
        return;
    }

    const status = getGradeStatus(result.average);

    resultsContent.innerHTML = `
        <div class="average-display" style="color: ${status.color}">
            ${result.average.toFixed(2)}/20
        </div>

        <div class="status-message" style="color: ${status.color}">
            ${status.message}
        </div>

        <div class="calculation-details">
            <div class="detail-item">
                <div class="detail-value">${result.enteredGrades}</div>
                <div class="detail-label">Matières comptées</div>
            </div>
            <div class="detail-item">
                <div class="detail-value">${result.requiredGradesEntered}/${result.requiredSubjects}</div>
                <div class="detail-label">Matières obligatoires</div>
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

        <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
            <h3 style="margin: 0 0 15px 0; text-align: center;">📊 Système de Score</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 1.8rem; font-weight: bold;">${result.score.toFixed(2)}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Score de base</div>
                </div>
                <div style="text-align: center; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
                    <div style="font-size: 1.8rem; font-weight: bold;">${result.scoreWith7Percent.toFixed(2)}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Score avec 7%</div>
                </div>
            </div>
        </div>

        ${!result.isComplete ? `
            <p style="color: var(--warning-color); font-weight: 600;">
                ⚠️ Moyenne partielle - ${result.requiredSubjects - result.requiredGradesEntered} matière(s) obligatoire(s) manquante(s)
            </p>
        ` : `
            <p style="color: var(--success-color); font-weight: 600;">
                ✅ Toutes les matières obligatoires sont saisies !
            </p>
        `}

        ${(() => {
            const allemandGrade = grades['allemand'];
            if (allemandGrade !== undefined && allemandGrade !== null && !isNaN(allemandGrade)) {
                if (allemandGrade > 10) {
                    return `<p style="color: var(--success-color); font-weight: 600;">
                        ✅ Allemand (${allemandGrade}/20) compte dans votre moyenne !
                    </p>`;
                } else {
                    return `<p style="color: var(--warning-color); font-weight: 600;">
                        ⚠️ Allemand (${allemandGrade}/20) ne compte pas (note ≤10)
                    </p>`;
                }
            }
            return '';
        })()}
    `;
}

// Update progress bar
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const completedSubjects = Object.keys(grades).filter(key =>
        grades[key] !== undefined && grades[key] !== null && !isNaN(grades[key])
    ).length;
    const percentage = (completedSubjects / subjects.length) * 100;
    progressFill.style.width = `${percentage}%`;
}

// Handle grade input
function handleGradeInput(event, subjectId) {
    const input = event.target;
    const value = input.value.trim();

    if (value === '') {
        delete grades[subjectId];
        input.classList.remove('invalid');
    } else {
        const validatedGrade = validateGrade(value);
        if (validatedGrade !== null) {
            grades[subjectId] = validatedGrade;
            input.classList.remove('invalid');
        } else {
            input.classList.add('invalid');
        }
    }

    updateResults();
    updateProgress();
}

// Handle grade blur
function handleGradeBlur(event, subjectId) {
    const input = event.target;
    const value = input.value.trim();

    if (value !== '' && validateGrade(value) === null) {
        input.value = '';
        delete grades[subjectId];
        input.classList.remove('invalid');
        updateResults();
        updateProgress();
    }
}

// Clear all grades
function clearAllGrades() {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les notes ?')) {
        grades = {};
        localStorage.removeItem('bac_informatique_grades');

        subjects.forEach(subject => {
            const input = document.getElementById(`grade-${subject.id}`);
            if (input) {
                input.value = '';
                input.classList.remove('invalid');
            }
        });

        updateResults();
        updateProgress();
    }
}

// Save grades with feedback
function saveGradesWithFeedback() {
    saveGrades();

    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '✅ Sauvegardé !';
    saveBtn.style.backgroundColor = 'var(--success-color)';

    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.backgroundColor = '';
    }, 2000);
}

// Initialize the application
function init() {
    console.log('Initializing calculator...');
    console.log('Subjects:', subjects);

    grades = loadGrades();
    console.log('Loaded grades:', grades);

    renderSubjects();
    updateResults();
    updateProgress();

    // Attach event listeners
    subjects.forEach(subject => {
        const input = document.getElementById(`grade-${subject.id}`);
        if (input) {
            input.addEventListener('input', (e) => handleGradeInput(e, subject.id));
            input.addEventListener('blur', (e) => handleGradeBlur(e, subject.id));
        } else {
            console.error(`Input not found for subject: ${subject.id}`);
        }
    });

    const clearBtn = document.getElementById('clear-btn');
    const saveBtn = document.getElementById('save-btn');

    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllGrades);
    } else {
        console.error('Clear button not found');
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveGradesWithFeedback);
    } else {
        console.error('Save button not found');
    }

    console.log('Calculator initialized successfully');
}

// Start the application when the page loads
document.addEventListener('DOMContentLoaded', init);
