console.log("V-Labs+ Loaded Successfully");

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

// Initialize first tab if present
document.addEventListener("DOMContentLoaded", () => {
    const firstTab = document.querySelector(".tab-btn");
    if (firstTab) {
        firstTab.click();
    }
});
