const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let score = 0;
const contadorSpan = document.getElementById('contador');

class Objeto2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 24;
        this.width = 48;
        this.height = 48;
        
        // Velocidades aleatorias diferentes para cada objeto
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        
        // 4 Direcciones de desplazamiento distintas: 0: Arriba, 1: Abajo, 2: Diagonal, 3: Circular
        this.tipoMovimiento = Math.floor(Math.random() * 4);
        this.angle = Math.random() * Math.PI * 2;
        this.centerX = this.x;
        this.centerY = this.y;

        this.choqueTimer = 0; // Control de la animación breve de choque
    }

    update() {
        if (this.tipoMovimiento === 0) {
            // Arriba
            this.y -= Math.abs(this.vy);
            if (this.y < 0) this.y = canvas.height;
        } else if (this.tipoMovimiento === 1) {
            // Abajo
            this.y += Math.abs(this.vy);
            if (this.y > canvas.height) this.y = 0;
        } else if (this.tipoMovimiento === 2) {
            // Diagonal
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        } else if (this.tipoMovimiento === 3) {
            // Circular
            this.angle += 0.03;
            this.x = this.centerX + Math.cos(this.angle) * 40;
            this.y = this.centerY + Math.sin(this.angle) * 40;
            this.centerX += this.vx * 0.5;
            this.centerY += this.vy * 0.5;

            if (this.centerX < 0 || this.centerX > canvas.width) this.vx *= -1;
            if (this.centerY < 0 || this.centerY > canvas.height) this.vy *= -1;
        }

        // Reducir temporizador de choque si está activo
        if (this.choqueTimer > 0) {
            this.choqueTimer--;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Animación breve de choque (Efecto de resplandor rojo al colisionar)
        if (this.choqueTimer > 0) {
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#ff3300';
        } else {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#00f3ff'; // Resplandor espectral traslúcido
        }

        // --- DIBUJO DEL FANTASMA CON TRANSPARENCIA REAL ---
        // Cuerpo traslúcido (deja ver el fondo del cementerio perfectamente)
        ctx.fillStyle = 'rgba(235, 245, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(24, 20, 18, Math.PI, 0, false); // Cabeza redondeada
        ctx.lineTo(42, 44);
        ctx.quadraticCurveTo(36, 36, 30, 44);   // Ondas de la parte baja
        ctx.quadraticCurveTo(24, 36, 18, 44);
        ctx.quadraticCurveTo(12, 36, 6, 44);
        ctx.lineTo(6, 20);
        ctx.closePath();
        ctx.fill();

        // Ojos expresivos oscuros
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(17, 18, 2.5, 0, Math.PI * 2);
        ctx.arc(31, 18, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Pequeña boca asustada
        ctx.beginPath();
        ctx.arc(24, 24, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Inicializar exactamente 25 objetos en el canvas
let objetos = [];
for (let i = 0; i < 25; i++) {
    let x = Math.random() * (canvas.width - 60);
    let y = Math.random() * (canvas.height - 60);
    objetos.push(new Objeto2D(x, y));
}

// Detección de colisiones entre objetos con rebote físico y animación breve de choque
function verificarColisiones() {
    for (let i = 0; i < objetos.length; i++) {
        for (let j = i + 1; j < objetos.length; j++) {
            let obj1 = objetos[i];
            let obj2 = objetos[j];

            let dx = (obj1.x + obj1.width/2) - (obj2.x + obj2.width/2);
            let dy = (obj1.y + obj1.height/2) - (obj2.y + obj2.height/2);
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia < obj1.radius + obj2.radius) {
                // Intercambiar velocidades (rebote)
                let tempVx = obj1.vx;
                let tempVy = obj1.vy;
                obj1.vx = obj2.vx;
                obj1.vy = obj2.vy;
                obj2.vx = tempVx;
                obj2.vy = tempVy;

                // Activar animación breve de choque
                obj1.choqueTimer = 15;
                obj2.choqueTimer = 15;
            }
        }
    }
}

// Evento de clic con el mouse para eliminar objetos y hacerlos reaparecer aleatoriamente
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let i = 0; i < objetos.length; i++) {
        let obj = objetos[i];
        let centerX = obj.x + obj.width / 2;
        let centerY = obj.y + obj.height / 2;
        let distancia = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);

        if (distancia < obj.radius) {
            score++;
            contadorSpan.textContent = score;

            // Reaparecer aleatoriamente en otra zona para mantener siempre 25 objetos
            obj.x = Math.random() * (canvas.width - 60);
            obj.y = Math.random() * (canvas.height - 60);
            obj.centerX = obj.x;
            obj.centerY = obj.y;
            break;
        }
    }
});

// Control del audio de fondo
const btnAudio = document.getElementById('btnAudio');
const bgAudio = document.getElementById('bgAudio');
let audioReproduciendo = false;

btnAudio.addEventListener('click', () => {
    if (!audioReproduciendo) {
        bgAudio.play();
        btnAudio.textContent = '🔇 Pausar Música';
        audioReproduciendo = true;
    } else {
        bgAudio.pause();
        btnAudio.textContent = '🔊 Reproducir Música';
        audioReproduciendo = false;
    }
});

// Bucle principal de animación
function animar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    verificarColisiones();

    objetos.forEach(obj => {
        obj.update();
        obj.draw();
    });

    requestAnimationFrame(animar);
}

// Iniciar animación
animar();