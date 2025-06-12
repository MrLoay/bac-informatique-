let selectedFiles = [];

// Check authentication (simplified for demo)
async function checkAuth() {
    console.log('Checking authentication...');
    
    // Always show admin content for demo mode
    document.getElementById('admin-content').style.display = 'block';
    document.getElementById('auth-check').style.display = 'none';
    
    try {
        const response = await fetch('/api/auth/check', {
            credentials: 'include'
        });
        
        console.log('Auth check response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Auth check result:', result);
            if (result.authenticated && result.user.role === 'admin') {
                showAlert('✅ Connecté en tant qu\'administrateur', 'success');
                return true;
            }
        }
        
        showAlert('⚠️ Mode démo - Connectez-vous pour toutes les fonctionnalités', 'error');
        return true; // Always return true for demo mode
        
    } catch (error) {
        console.error('Auth check error:', error);
        showAlert('⚠️ Mode démo - Fonctionnalités limitées', 'error');
        return true;
    }
}

// Logout function
async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login.html';
    }
}

// Initialize
async function init() {
    console.log('Initializing admin panel...');
    const isAuthenticated = await checkAuth();
    console.log('Authentication check result:', isAuthenticated);
    
    if (isAuthenticated) {
        console.log('User authenticated, setting up components...');
        setupFileUpload();
        setupFormValidation();
        console.log('Updating stats...');
        await updateStats();
        console.log('Initialization completed');
    } else {
        console.log('User not authenticated');
    }
}

// Setup file upload functionality
function setupFileUpload() {
    console.log('Setting up file upload...');
    const fileUpload = document.getElementById('file-upload');
    const fileInput = document.getElementById('file-input');
    const chooseFilesBtn = document.getElementById('choose-files-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const testBtn = document.getElementById('test-btn');
    const testUploadBtn = document.getElementById('test-upload-btn');
    const testFileBtn = document.getElementById('test-file-btn');
    const logoutBtn = document.getElementById('logout-btn');

    if (!fileUpload || !fileInput) {
        console.error('File upload elements not found!');
        return;
    }

    console.log('File upload elements found, adding event listeners...');

    // File upload area click
    fileUpload.addEventListener('click', (e) => {
        console.log('File upload area clicked, target:', e.target.className);
        if (e.target === fileUpload || 
            e.target.classList.contains('upload-icon') || 
            e.target.classList.contains('upload-text') ||
            e.target.tagName === 'STRONG') {
            console.log('Triggering file input click from upload area');
            fileInput.click();
        }
    });

    // Choose files button
    if (chooseFilesBtn) {
        chooseFilesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Choose files button clicked!');
            console.log('File input element:', fileInput);
            if (fileInput) {
                fileInput.click();
                console.log('File input clicked');
            } else {
                console.error('File input not found!');
            }
        });
    } else {
        console.error('Choose files button not found!');
    }

    // Upload button
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            console.log('Upload button clicked!');
            uploadFiles();
        });
    }

    // Test button
    if (testBtn) {
        testBtn.addEventListener('click', () => {
            console.log('Test button clicked!');
            testFunction();
        });
    }

    // Test upload button
    if (testUploadBtn) {
        testUploadBtn.addEventListener('click', () => {
            console.log('Test upload button clicked!');
            testUpload();
        });
    }

    // Test file input button
    if (testFileBtn) {
        testFileBtn.addEventListener('click', () => {
            console.log('Test file input button clicked!');
            testFileInput();
        });
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('Logout button clicked!');
            logout();
        });
    }

    // Drag and drop
    fileUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileUpload.classList.add('dragover');
        console.log('Drag over detected');
    });

    fileUpload.addEventListener('dragleave', () => {
        fileUpload.classList.remove('dragover');
        console.log('Drag leave detected');
    });

    fileUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        fileUpload.classList.remove('dragover');
        console.log('Drop detected, files:', e.dataTransfer.files.length);
        handleFiles(e.dataTransfer.files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        console.log('File input change detected, files:', e.target.files.length);
        if (e.target.files.length > 0) {
            console.log('Files selected:', Array.from(e.target.files).map(f => f.name));
            handleFiles(e.target.files);
        } else {
            console.log('No files selected');
        }
    });

    // Alternative file input change
    const altFileInput = document.getElementById('alt-file-input');
    if (altFileInput) {
        altFileInput.addEventListener('change', (e) => {
            console.log('Alternative file input change detected, files:', e.target.files.length);
            if (e.target.files.length > 0) {
                console.log('Files selected via alternative input:', Array.from(e.target.files).map(f => f.name));
                handleFiles(e.target.files);
                showAlert('✅ Files selected via alternative input!', 'success');
            }
        });
    }

    console.log('File upload setup completed');
}

// Handle selected files
function handleFiles(files) {
    console.log('Files selected:', files.length);
    for (let file of files) {
        console.log('Processing file:', file.name, 'Type:', file.type);
        if (file.type === 'application/pdf') {
            selectedFiles.push(file);
            console.log('Added PDF file:', file.name);
        } else {
            showAlert(`❌ ${file.name} n'est pas un fichier PDF`, 'error');
        }
    }
    updateFileList();
    updateUploadButton();
}

// Update file list display
function updateFileList() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-name">📄 ${file.name}</div>
                <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            <button class="remove-file-btn" data-index="${index}" style="background: var(--error-color); color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                🗑️ Supprimer
            </button>
        </div>
    `).join('');

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            removeFile(index);
        });
    });
}

// Remove file from list
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
    updateUploadButton();
}

// Update upload button state
function updateUploadButton() {
    const uploadBtn = document.getElementById('upload-btn');
    const hasFiles = selectedFiles.length > 0;
    const hasRequiredFields = document.getElementById('subject-select').value && 
                            document.getElementById('year-input').value && 
                            document.getElementById('session-select').value;
    
    const shouldEnable = hasFiles && hasRequiredFields;
    uploadBtn.disabled = !shouldEnable;
    
    console.log('Upload button state:', {
        hasFiles,
        hasRequiredFields,
        shouldEnable,
        disabled: uploadBtn.disabled
    });
}

// Upload files to backend (simplified)
async function uploadFiles() {
    console.log('Upload function called');

    const subject = document.getElementById('subject-select').value;
    const year = document.getElementById('year-input').value;
    const session = document.getElementById('session-select').value;
    const fileType = document.querySelector('input[name="file-type"]:checked').value;

    console.log('Form values:', { subject, year, session, fileType });

    if (!subject || !year || !session) {
        showAlert('❌ Veuillez remplir tous les champs requis', 'error');
        return;
    }

    if (selectedFiles.length === 0) {
        showAlert('❌ Veuillez sélectionner au moins un fichier', 'error');
        return;
    }

    console.log('Selected files:', selectedFiles.length);

    // Always use demo upload for now
    showAlert('📤 Upload en cours...', 'success');

    try {
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('year', year);
        formData.append('session', session);
        formData.append('fileType', fileType);

        selectedFiles.forEach((file, index) => {
            console.log(`Adding file ${index}:`, file.name);
            formData.append('files', file);
        });

        console.log('Sending request to /api/upload-demo');

        const response = await fetch('/api/upload-demo', {
            method: 'POST',
            body: formData
        });

        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);

        if (response.ok) {
            showAlert(`✅ ${result.message}`, 'success');
            selectedFiles = [];
            updateFileList();
            updateUploadButton();
            await updateStats();
        } else {
            showAlert(`❌ Erreur: ${result.error}`, 'error');
        }

    } catch (error) {
        console.error('Upload error:', error);
        showAlert('❌ Erreur de connexion au serveur: ' + error.message, 'error');
    }
}

// Update statistics from backend
async function updateStats() {
    try {
        const response = await fetch('/api/exams/stats');
        const stats = await response.json();

        if (response.ok) {
            document.getElementById('total-files').textContent = stats.totalExams;
            document.getElementById('total-size').textContent = `${stats.totalSize} MB`;
        } else {
            console.error('Failed to fetch stats:', stats.error);
            // Fallback to default values
            document.getElementById('total-files').textContent = '0';
            document.getElementById('total-size').textContent = '0 MB';
        }
    } catch (error) {
        console.error('Stats fetch error:', error);
        // Fallback to default values
        document.getElementById('total-files').textContent = '0';
        document.getElementById('total-size').textContent = '0 MB';
    }
}

// Show alert function
function showAlert(message, type) {
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    const container = document.querySelector('.container');
    container.insertBefore(alert, container.children[2]);

    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Setup form validation event listeners
function setupFormValidation() {
    const subjectSelect = document.getElementById('subject-select');
    const yearInput = document.getElementById('year-input');
    const sessionSelect = document.getElementById('session-select');

    if (subjectSelect) {
        subjectSelect.addEventListener('change', updateUploadButton);
    }
    if (yearInput) {
        yearInput.addEventListener('input', updateUploadButton);
    }
    if (sessionSelect) {
        sessionSelect.addEventListener('change', updateUploadButton);
    }
}

// Test function
function testFunction() {
    console.log('Test function called!');
    showAlert('✅ JavaScript fonctionne correctement!', 'success');
}

// Test upload function (bypasses form validation)
async function testUpload() {
    console.log('Test upload function called!');

    try {
        const formData = new FormData();
        formData.append('subject', 'math');
        formData.append('year', '2024');
        formData.append('session', 'principale');
        formData.append('fileType', 'exam');

        console.log('Sending test request to /api/upload-demo');

        const response = await fetch('/api/upload-demo', {
            method: 'POST',
            body: formData
        });

        console.log('Test response status:', response.status);
        const result = await response.json();
        console.log('Test response data:', result);

        if (response.ok) {
            showAlert(`✅ Test upload réussi: ${result.message}`, 'success');
        } else {
            showAlert(`❌ Test upload échoué: ${result.error}`, 'error');
        }

    } catch (error) {
        console.error('Test upload error:', error);
        showAlert('❌ Erreur test upload: ' + error.message, 'error');
    }
}

// Test file input function
function testFileInput() {
    console.log('Test file input function called!');
    const fileInput = document.getElementById('file-input');

    if (fileInput) {
        console.log('File input found, triggering click...');
        fileInput.click();
        showAlert('📁 File input triggered - Select a file to test', 'success');
    } else {
        console.error('File input not found!');
        showAlert('❌ File input element not found', 'error');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', init);
