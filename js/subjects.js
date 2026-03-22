// Require authentication
requireAuth();

let allLabs = [];

async function loadLabs() {
    const container = document.querySelector('.features') || document.querySelector('section');
    if (!container) return;
    
    // Show loading state
    container.innerHTML = '<p style="text-align: center; padding: 40px;">Loading labs...</p>';

    try {
        allLabs = await labs.getAll();
        displayLabs(allLabs);
    } catch (err) {
        console.error('Failed to load labs:', err);
        container.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Failed to load labs. Make sure the server is running.</p>';
    }
}

function displayLabs(labsToDisplay) {
    const container = document.querySelector('.features');
    if (!container) return;

    if (labsToDisplay.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 40px;">No labs available yet.</p>';
        return;
    }

    // Group labs by subject/category (or display all)
    const labsByCategory = groupLabsByCategory(labsToDisplay);
    
    let html = '';
    for (const [category, categoryLabs] of Object.entries(labsByCategory)) {
        html += `<h3 style="grid-column: 1/-1; margin-top: 30px; margin-bottom: 15px;">${category}</h3>`;
        categoryLabs.forEach(lab => {
            html += `
                <div class="card" onclick="goToLab(${lab.id})" style="cursor: pointer;">
                    <h3>${lab.title}</h3>
                    <p style="margin-top: 10px;" class="text-pale">${lab.description || 'No description available'}</p>
                    <div style="margin-top: 15px; font-weight: bold;" class="text-accent">Open Lab &rarr;</div>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
}

function groupLabsByCategory(labsList) {
    const grouped = {};
    
    labsList.forEach(lab => {
        const category = lab.category || lab.language || 'Other';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(lab);
    });
    
    return grouped;
}

function goToLab(labId) {
    // Store the selected lab ID for the lab page
    sessionStorage.setItem('currentLabId', labId);
    
    // Determine which HTML page to go to based on first lab title
    const lab = allLabs.find(l => l.id === labId);
    if (!lab) {
        alert('Lab not found');
        return;
    }

    const title = lab.title.toLowerCase();
    let page = 'lab.html';
    
    if (title.includes('ohm')) page = 'lab-ohms.html';
    else if (title.includes('titration') || title.includes('acid')) page = 'acid-base.html';
    else if (title.includes('photosynthesis')) page = 'lab-photosynthesis.html';
    
    window.location.href = page;
}

// Load labs when page is ready
document.addEventListener('DOMContentLoaded', loadLabs);
