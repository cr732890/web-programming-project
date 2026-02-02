const canvas = document.createElement("canvas");
document.body.prepend(canvas);
canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.zIndex = "-1";
canvas.style.background = "radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)";

const ctx = canvas.getContext("2d");

let stars = [];
const numStars = 800;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.z = Math.random() * canvas.width;
        this.pz = this.z;
    }

    update() {
        this.z = this.z - 10; // Speed of stars
        if (this.z < 1) {
            this.z = canvas.width;
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.pz = this.z;
        }
    }

    draw() {
        const x = (this.x - canvas.width / 2) * (canvas.width / this.z);
        const y = (this.y - canvas.height / 2) * (canvas.width / this.z);

        const px = (this.x - canvas.width / 2) * (canvas.width / this.pz);
        const py = (this.y - canvas.height / 2) * (canvas.width / this.pz);

        const radius = Math.max(0, (1 - this.z / canvas.width));

        const sx = x + canvas.width / 2;
        const sy = y + canvas.height / 2;

        const spx = px + canvas.width / 2;
        const spy = py + canvas.height / 2;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${radius})`;
        ctx.lineWidth = radius * 2;
        ctx.moveTo(spx, spy);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        this.pz = this.z;
    }
}

for (let i = 0; i < numStars; i++) {
    stars.push(new Star());
}

function animate() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; // Trail effect
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const star of stars) {
        star.update();
        star.draw();
    }
    requestAnimationFrame(animate);
}

animate();
