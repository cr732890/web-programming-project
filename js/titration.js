const canvas = document.getElementById("titrationCanvas");
const ctx = canvas.getContext("2d");

const slider = document.getElementById("volume");
const volVal = document.getElementById("volVal");
const phVal = document.getElementById("phVal");
const statusText = document.getElementById("status");

// Colors
const GLASS_COLOR = "rgba(255, 255, 255, 0.5)";
const LIQUID_ACID = "rgba(255, 99, 71, 0.8)"; // Reddish
const LIQUID_NEUTRAL = "rgba(255, 182, 193, 0.8)"; // Pink
const LIQUID_BASE = "rgba(135, 206, 250, 0.8)"; // Blueish
const TEXT_COLOR = "#ffffff";

// Correct chemistry
const acidMoles = 0.00025;   // 0.01M × 25 ml
const baseMolarity = 0.01;

let dropY = 130;
let animating = false;

// pH calculation
function calculatePH(volumeBase) {
    const baseMoles = baseMolarity * (volumeBase / 1000);

    if (baseMoles < acidMoles) {
        return (-Math.log10(acidMoles - baseMoles)).toFixed(2);
    } else if (Math.abs(baseMoles - acidMoles) < 0.000001) {
        return "7.00";
    } else {
        const poh = -Math.log10(baseMoles - acidMoles);
        return (14 - poh).toFixed(2);
    }
}

// Draw proper glassware
function draw(volume) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;

    /* ===== TEST TUBE / BURETTE (NaOH) ===== */
    ctx.lineWidth = 2;
    ctx.strokeStyle = GLASS_COLOR;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(centerX - 20, 40);
    ctx.lineTo(centerX - 20, 150); // Left wall
    // Stopcock area
    ctx.moveTo(centerX - 20, 150);
    ctx.lineTo(centerX, 170);
    ctx.lineTo(centerX + 20, 150);

    ctx.moveTo(centerX + 20, 150);
    ctx.lineTo(centerX + 20, 40); // Right wall

    // Top opening ellipse
    ctx.ellipse(centerX, 40, 20, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // NaOH liquid inside burette
    ctx.fillStyle = LIQUID_BASE;
    // Simple rect fill for liquid
    const liquidHeight = Math.max(0, 100 - volume * 2);
    ctx.fillRect(centerX - 18, 50, 36, liquidHeight);

    ctx.fillStyle = TEXT_COLOR;
    ctx.font = "14px Roboto";
    ctx.fillText("NaOH (Base)", centerX + 40, 60);

    /* ===== DROP ANIMATION ===== */
    if (animating) {
        ctx.beginPath();
        ctx.arc(centerX, dropY, 5, 0, Math.PI * 2);
        ctx.fillStyle = LIQUID_BASE;
        ctx.shadowBlur = 10;
        ctx.shadowColor = LIQUID_BASE;
        ctx.fill();
        ctx.shadowBlur = 0;

        dropY += 5;
        if (dropY > 210) { // Hit the beaker liquid
            dropY = 170;
            animating = false;
        }
    }

    /* ===== BEAKER (HCl) ===== */
    const beakerTop = 210;
    const beakerWidth = 140;
    const beakerHeight = 80;

    ctx.strokeStyle = GLASS_COLOR;
    ctx.beginPath();
    ctx.moveTo(centerX - beakerWidth / 2, beakerTop);
    ctx.lineTo(centerX - beakerWidth / 2, beakerTop + beakerHeight); // Left wall
    ctx.quadraticCurveTo(centerX, beakerTop + beakerHeight + 20, centerX + beakerWidth / 2, beakerTop + beakerHeight); // Bottom curve
    ctx.lineTo(centerX + beakerWidth / 2, beakerTop); // Right wall
    ctx.stroke();

    // Solution color based on pH
    if (volume < 25) ctx.fillStyle = LIQUID_ACID;        // acidic
    else if (Math.abs(volume - 25) < 1) ctx.fillStyle = LIQUID_NEUTRAL; // neutralish
    else ctx.fillStyle = LIQUID_BASE;                    // basic

    ctx.shadowBlur = 20;
    ctx.shadowColor = ctx.fillStyle;

    // Fill beaker liquid
    ctx.beginPath();
    ctx.moveTo(centerX - beakerWidth / 2 + 5, beakerTop + 30);
    ctx.lineTo(centerX - beakerWidth / 2 + 5, beakerTop + beakerHeight);
    ctx.quadraticCurveTo(centerX, beakerTop + beakerHeight + 15, centerX + beakerWidth / 2 - 5, beakerTop + beakerHeight);
    ctx.lineTo(centerX + beakerWidth / 2 - 5, beakerTop + 30);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = TEXT_COLOR;
    ctx.fillText("HCl + Phenolphthalein", centerX - 60, beakerTop + beakerHeight + 40);
}

// Animation loop
function animateLoop() {
    draw(slider.value);
    if (animating) {
        requestAnimationFrame(animateLoop);
    }
}

// Slider interaction
slider.addEventListener("input", (e) => {
    volVal.textContent = slider.value;

    const ph = calculatePH(slider.value);
    phVal.textContent = ph;

    if (ph < 7) {
        statusText.textContent = "Solution is acidic";
        statusText.style.color = "#ff6347";
    }
    else if (Math.abs(ph - 7) < 0.5) {
        statusText.textContent = "Neutralization point reached!";
        statusText.style.color = "#ffb6c1";
    }
    else {
        statusText.textContent = "Solution is basic";
        statusText.style.color = "#87cefa";
    }

    if (!animating) {
        animating = true;
        animateLoop();
    }
});

// Start initial draw
draw(0);
