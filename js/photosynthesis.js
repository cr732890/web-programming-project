const canvas = document.getElementById("photoCanvas");
const ctx = canvas.getContext("2d");

const lightSlider = document.getElementById("light");
const co2Slider = document.getElementById("co2");
const tempSlider = document.getElementById("temp");

const lightVal = document.getElementById("lightVal");
const co2Val = document.getElementById("co2Val");
const tempVal = document.getElementById("tempVal");
const rateVal = document.getElementById("rateVal");
const statusText = document.getElementById("status");

// Neon Colors
const NEON_GREEN = "#39ff14";
const NEON_BLUE = "#00f2fe";
const NEON_YELLOW = "#ffff00"; // For light
const GLASS_COLOR = "rgba(255, 255, 255, 0.3)";
const BUBBLE_COLOR = "rgba(255, 255, 255, 0.8)";


let bubbles = [];

function calculateRate() {
    const light = parseInt(lightSlider.value);
    const co2 = parseInt(co2Slider.value);
    const temp = parseInt(tempSlider.value);

    // Update UI
    lightVal.textContent = light;
    co2Val.textContent = (co2 * 0.001).toFixed(3); // Visual scale
    tempVal.textContent = temp;

    // Simulation Logic
    // Limiting factors: Rate is limited by the scarcest resource
    // Temperature is a bell curve (optimum ~30C)

    let lightFactor = light / 100; // 0 to 1
    let co2Factor = co2 / 100;     // 0 to 1

    // Temp factor: Gaussian-ish curve
    // Peak at 30, drops off at 0 and 45.
    let tempFactor = 0;
    if (temp > 0 && temp < 45) {
        tempFactor = Math.exp(-Math.pow(temp - 30, 2) / 100);
    } else {
        tempFactor = 0;
    }

    // Rate calculation
    // Minimum of limiting input factors multiplied by temp efficiency
    let rawRate = Math.min(lightFactor, co2Factor) * tempFactor * 100;

    // Status Text
    if (temp > 40) statusText.textContent = "Too hot! Enzymes denaturing.";
    else if (temp < 5) statusText.textContent = "Too cold! Inactive enzymes.";
    else if (light < 10) statusText.textContent = "Light is the limiting factor.";
    else if (co2 < 10) statusText.textContent = "CO2 is the limiting factor.";
    else statusText.textContent = "Photosynthesis active.";

    let bpm = Math.floor(rawRate);
    rateVal.textContent = bpm;

    return bpm;
}

function drawScene(bpm) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 50;

    // Light Source (Sun/Bulb) - Top Right
    const lightIntensity = lightSlider.value / 100;
    if (lightIntensity > 0) {
        ctx.beginPath();
        ctx.arc(350, 50, 30, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 0, ${0.2 + lightIntensity * 0.8})`;
        ctx.shadowBlur = 20 + lightIntensity * 20;
        ctx.shadowColor = NEON_YELLOW;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Rays
        ctx.strokeStyle = `rgba(255, 255, 0, ${lightIntensity * 0.5})`;
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(350, 50);
            const angle = (Date.now() / 1000 + i * (Math.PI / 4));
            ctx.lineTo(350 + Math.cos(angle) * 50, 50 + Math.sin(angle) * 50);
            ctx.stroke();
        }
    }

    // Beaker
    ctx.strokeStyle = GLASS_COLOR;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 80, centerY - 100);
    ctx.lineTo(centerX - 80, centerY + 80);
    ctx.quadraticCurveTo(centerX, centerY + 90, centerX + 80, centerY + 80);
    ctx.lineTo(centerX + 80, centerY - 100);
    ctx.stroke();

    // Water
    ctx.fillStyle = "rgba(0, 242, 254, 0.1)"; // Very faint neon blue
    ctx.beginPath();
    ctx.moveTo(centerX - 75, centerY - 60);
    ctx.lineTo(centerX - 75, centerY + 80); // Bottom
    ctx.quadraticCurveTo(centerX, centerY + 88, centerX + 75, centerY + 80);
    ctx.lineTo(centerX + 75, centerY - 60);
    ctx.fill();

    // Funnel (inverted)
    ctx.strokeStyle = GLASS_COLOR;
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY + 60); // Base Left
    ctx.lineTo(centerX, centerY - 40);      // Stem Top
    ctx.lineTo(centerX + 40, centerY + 60); // Base Right
    ctx.stroke();

    // Test Tube over funnel
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY - 40);
    ctx.lineTo(centerX - 10, centerY - 80);
    ctx.arc(centerX, centerY - 80, 10, Math.PI, 0); // Top curve
    ctx.lineTo(centerX + 10, centerY - 40);
    ctx.stroke();

    // Hydrilla Plant (Neon Green)
    ctx.strokeStyle = NEON_GREEN;
    ctx.shadowBlur = 5;
    ctx.shadowColor = NEON_GREEN;
    ctx.lineWidth = 2;

    // Simple plant structure inside funnel
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 60);
    ctx.quadraticCurveTo(centerX - 20, centerY + 20, centerX, centerY);
    ctx.quadraticCurveTo(centerX + 20, centerY + 20, centerX, centerY + 40);
    ctx.stroke();

    // Leaves
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + 50);
    ctx.lineTo(centerX - 15, centerY + 40);
    ctx.moveTo(centerX, centerY + 30);
    ctx.lineTo(centerX + 15, centerY + 20);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Bubbles Animation
    drawBubbles(bpm, centerX, centerY);
}

function drawBubbles(bpm, centerX, centerY) {
    // Add bubbles based on rate
    // BPM = bubbles per minute. 
    // Frame rate ~60fps. Risk of too many bubbles. 
    // Let's interpret BPM as a spawn probability.

    if (bpm > 0 && Math.random() < (bpm / 3600)) { // Simplified output
        bubbles.push({
            x: centerX + (Math.random() - 0.5) * 5,
            y: centerY - 10, // Start at funnel top
            speed: 0.5 + Math.random() * 0.5,
            radius: 1 + Math.random() * 2
        });
    } else if (bpm > 60 && Math.random() < 0.05) {
        // Boost spawn for high rates visually
        bubbles.push({
            x: centerX + (Math.random() - 0.5) * 5,
            y: centerY - 10,
            speed: 0.5 + Math.random() * 0.5,
            radius: 1 + Math.random() * 2
        });
    }

    ctx.fillStyle = BUBBLE_COLOR;
    ctx.shadowBlur = 5;
    ctx.shadowColor = BUBBLE_COLOR;

    for (let i = bubbles.length - 1; i >= 0; i--) {
        let b = bubbles[i];
        b.y -= b.speed;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Remove if collected in test tube (top)
        if (b.y < centerY - 80) {
            bubbles.splice(i, 1);
        }
    }

    ctx.shadowBlur = 0;
}

function loop() {
    const bpm = calculateRate();
    drawScene(bpm);
    requestAnimationFrame(loop);
}

lightSlider.addEventListener("input", calculateRate);
co2Slider.addEventListener("input", calculateRate);
tempSlider.addEventListener("input", calculateRate);

loop();
