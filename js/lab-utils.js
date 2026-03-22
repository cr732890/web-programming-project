// Lab utility functions for handling submissions and lab interactions

let currentLabId = null;

// Map page names to lab IDs
const LAB_ID_MAP = {
    'lab-ohms.html': 1,
    'acid-base.html': 2,
    'lab-photosynthesis.html': 3
};

// Get lab ID based on current page
function getLabId() {
    if (!currentLabId) {
        // Try from sessionStorage first
        const storedId = sessionStorage.getItem('currentLabId');
        if (storedId) {
            currentLabId = parseInt(storedId);
        } else {
            // Detect from current page
            const pageName = window.location.pathname.split('/').pop();
            currentLabId = LAB_ID_MAP[pageName] || null;
        }
    }
    return currentLabId;
}

// Setup submission form with textarea
function setupLabSubmission() {
    const submitBtn = document.getElementById('submit-btn');
    const submissionText = document.getElementById('submission-code');
    const messageEl = document.getElementById('submission-message');

    if (!submitBtn) return;

    submitBtn.addEventListener('click', async () => {
        const labId = getLabId();
        const code = submissionText.value.trim();
        
        console.log('Lab ID:', labId);
        console.log('Token:', getToken());
        
        if (!labId) {
            showSubmissionMessage(messageEl, 'Error: Lab ID not found. Please refresh the page.', 'error');
            return;
        }

        if (!code) {
            showSubmissionMessage(messageEl, 'Please enter your code or observations', 'error');
            return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            console.log('Submitting:', { labId, codeLength: code.length });
            const result = await submissions.submit(labId, code);
            console.log('Submission result:', result);
            
            showSubmissionMessage(messageEl, '✓ Submitted successfully!', 'success');
            submissionText.value = '';
            
            setTimeout(() => {
                window.location.href = 'subjects.html';
            }, 2000);
        } catch (err) {
            console.error('Submission error:', err);
            showSubmissionMessage(messageEl, err.message || 'Submission failed', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Lab';
        }
    });
}

// Show submission message
function showSubmissionMessage(element, message, type = 'info') {
    if (!element) return;
    element.textContent = message;
    element.style.color = type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue';
}

// Load lab details and display in sidebar or header
async function loadLabDetails() {
    const labId = getLabId();
    if (!labId) return;

    try {
        const lab = await labs.getById(labId);
        displayLabDetails(lab);
    } catch (err) {
        console.error('Failed to load lab details:', err);
    }
}

function displayLabDetails(lab) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const header = sidebar.querySelector('h3');
    if (header) {
        header.textContent = lab.title;
    }
}
