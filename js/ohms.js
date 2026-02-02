const voltageSlider = document.getElementById("voltage");
const resistanceSlider = document.getElementById("resistance");

const vVal = document.getElementById("vVal");
const rVal = document.getElementById("rVal");
const currentText = document.getElementById("current");

const canvas = document.getElementById("circuitCanvas");
const ctx = canvas.getContext("2d");

// Neon Colors
const NEON_BLUE = "#00f2fe";
const NEON_PINK = "#ff0099";
const WHITE = "#ffffff";
const BATTERY_COLOR = "#ffd700";

function calculateCurrent() {
    const V = voltageSlider.value;
    const R = resistanceSlider.value;
    const I = (V / R).toFixed(2);

    vVal.textContent = V;
    rVal.textContent = R;
    currentText.textContent = I;

    drawCircuit(I);
}

function drawCircuit(current) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Battery Geometry
    const battX = 60;
    const battY = 120;

    // Wire Path
    ctx.beginPath();
    ctx.strokeStyle = WHITE;
    // Left side loop
    ctx.moveTo(battX, battY - 40); // Top of battery
    ctx.lineTo(battX, 80);
    ctx.lineTo(300, 80); // Top wire
    ctx.lineTo(300, 160); // Right wire
    ctx.lineTo(battX, 160); // Bottom wire
    ctx.lineTo(battX, battY + 40); // Bottom of battery
    ctx.stroke();

    // Battery Symbol
    ctx.fillStyle = BATTERY_COLOR;
    // Positive Terminal (Long)
    ctx.fillRect(battX - 10, battY - 15, 20, 4);
    ctx.fillRect(battX - 2, battY - 25, 4, 24); // Plus sign vertical

    // Negative Terminal (Short)
    ctx.fillRect(battX - 10, battY + 15, 20, 4);

    // Resistor (Zig Zag)
    ctx.strokeStyle = NEON_PINK;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(250, 80);
    ctx.lineTo(270, 80); // Start wire

    // Zig Zags
    ctx.lineTo(275, 65);
    ctx.lineTo(285, 95);
    ctx.lineTo(295, 65);
    ctx.lineTo(305, 95);
    ctx.lineTo(315, 65);
    ctx.lineTo(325, 95);

    ctx.lineTo(330, 80); // End zig
    ctx.lineTo(350, 80); // End wire
    ctx.stroke();

    // Animating Current (Electrons)
    ctx.fillStyle = NEON_BLUE;
    const visualSpeed = current * 2; // Speed factor

    // Simple particle system simulation for 'flow'
    const time = Date.now() / 1000;
    const offset = (time * visualSpeed * 20) % 240; // Loop length

    // Draw dots along top wire
    for (let i = 0; i < 5; i++) {
        let x = 80 + (offset + i * 50) % 220;
        if (x > 270 && x < 330) continue; // Skip inside resistor visually

        ctx.beginPath();
        // ctx.arc(x, 80, 4, 0, Math.PI*2); // Top wire
        // ctx.fill();
    }

    // Draw glowing text
    ctx.font = "16px Roboto";
    ctx.fillStyle = WHITE;
    ctx.fillText("Battery", 35, 200);
    ctx.fillStyle = NEON_PINK;
    ctx.fillText("Resistor", 270, 50);

    ctx.font = "bold 20px Roboto";
    ctx.fillStyle = NEON_BLUE;
    ctx.fillText(`I = ${current} A`, 160, 220);

    // Electron Flow Animation
    drawElectrons(current);
}

let electronOffset = 0;
function drawElectrons(current) {
    if (current <= 0) return;

    ctx.fillStyle = NEON_BLUE;
    ctx.shadowBlur = 10;
    ctx.shadowColor = NEON_BLUE;

    // Path points roughly: (60,160) -> (300,160) -> (300,80) -> (60,80)
    // Simplified flow visualization: Just dots moving right on bottom, left on top? 
    // Circuit: Clockwise convention (Positive -> Negative). 
    // Real electrons: Negative -> Positive. Let's do conventional current (CW).

    const speed = current * 2;
    electronOffset = (electronOffset + speed) % 40;

    for (let i = 0; i < 20; i++) {
        // Draw some dots along the path
        // Top wire (L -> R)
        ctx.beginPath();
        let x = (i * 40 + electronOffset) % 240 + 60;
        // ctx.arc(x, 80, 3, 0, Math.PI*2);
        // ctx.fill();

        // Let's just create a simple loop
    }

    // Simple animated dots
    const totalLength = 600; // approx perim
    const gap = 40;
    const numDots = totalLength / gap;

    for (let i = 0; i < numDots; i++) {
        let dist = (i * gap + Date.now() / 10 * current) % totalLength;
        let pos = getPosOnRect(dist);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;

    requestAnimationFrame(() => drawCircuit(current));
}

// Helper to trace rectangle (60,80) to (300, 160)
function getPosOnRect(dist) {
    // 0 starts at top-left (60, 80) moving Right
    // Top w: 240
    // Right h: 80
    // Bottom w: 240
    // Left h: 80
    if (dist < 240) return { x: 60 + dist, y: 80 };
    dist -= 240;
    if (dist < 80) return { x: 300, y: 80 + dist };
    dist -= 80;
    if (dist < 240) return { x: 300 - dist, y: 160 };
    dist -= 240;
    return { x: 60, y: 160 - dist };
}

voltageSlider.addEventListener("input", calculateCurrent);
resistanceSlider.addEventListener("input", calculateCurrent);

// Initial draw
calculateCurrent();
