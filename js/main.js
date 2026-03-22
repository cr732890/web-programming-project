console.log("V-Labs+ Loaded Successfully");

// Update header with user info and logout button
function updateHeaderWithUser() {
    const user = getCurrentUser();
    const nav = document.querySelector('nav');
    
    if (!nav) return;

    // Find or create user info container
    let userContainer = document.getElementById('user-info');
    if (!userContainer) {
        userContainer = document.createElement('div');
        userContainer.id = 'user-info';
        userContainer.style.cssText = 'display: flex; align-items: center; gap: 15px;';
        nav.appendChild(userContainer);
    }

    if (user) {
        userContainer.innerHTML = `
            <span style="color: #999;">${user.name || user.username}</span>
            <button id="logout-btn" class="btn" style="padding: 8px 16px; font-size: 0.9rem;">Logout</button>
        `;
        
        // Hide login link
        const loginLink = nav.querySelector('a[href="login.html"]');
        if (loginLink) {
            loginLink.style.display = 'none';
        }
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            clearAuth();
            window.location.href = 'index.html';
        });
    } else {
        userContainer.innerHTML = '';
        // Show login link
        const loginLink = nav.querySelector('a[href="login.html"]');
        if (loginLink) {
            loginLink.style.display = 'block';
        }
    }
}

// Redirect to login if not authenticated (for protected pages)
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

function openTab(event, tabName) {
    // Hide all tab content
    const contents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < contents.length; i++) {
        contents[i].classList.remove("active");
    }

    // Deactivate all tab buttons
    const buttons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove("active");
    }

    // Show current tab and activate button
    document.getElementById(tabName).classList.add("active");
    if (event) {
        event.currentTarget.classList.add("active");
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    updateHeaderWithUser();
    
    const firstTab = document.querySelector(".tab-btn");
    if (firstTab) {
        firstTab.click();
    }
});
