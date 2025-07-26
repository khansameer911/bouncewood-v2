const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

let x = 200, y = 200;
let speed = 4;
let score = 0;
let bestScore = localStorage.getItem('bestScore') || 0;
let gameOver = false;
let timeLeft = 30;

const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const gameOverText = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

const coinSound = document.getElementById('coinSound');
const gameOverSound = document.getElementById('gameOverSound');

let keys = {};
let coins = [];
let obstacles = [];

const ballImg = new Image();
ballImg.src = 'ball.png';

// Coin animation frames
let coinFrames = [];
for (let i = 0; i < 6; i++) {
    let img = new Image();
    img.src = `coin_${i}.png`;
    coinFrames.push(img);
}
let coinFrameIndex = 0;
let coinAnimCounter = 0;
const coinImg = new Image(); // fallback
coinImg.src = 'coin.png';

const obstacleImg = new Image();
obstacleImg.src = 'obstacle.png';

function createCoins() {
    coins = [];
    for (let i = 0; i < 3; i++) {
        coins.push({
            x: Math.random() * (canvas.width - 20),
            y: Math.random() * (canvas.height - 20),
            radius: 10
        });
    }
}

function drawCoins() {
    coins.forEach(coin => {
        // Animate coin spin
coinAnimCounter++;
if (coinAnimCounter % 8 === 0) {
    coinFrameIndex = (coinFrameIndex + 1) % coinFrames.length;
}
ctx.drawImage(coinFrames[coinFrameIndex], coin.x - 10, coin.y - 10, 20, 20);
    });
}

function collectCoins() {
    coins.forEach((coin, index) => {
        const dist = Math.hypot(x - coin.x, y - coin.y);
        if (dist < 20) {
            coins.splice(index, 1);
            score += 10;
            timeLeft += 4;
            coinSound.play();
            coins.push({
                x: Math.random() * (canvas.width - 20),
                y: Math.random() * (canvas.height - 20),
                radius: 10
            });
        }
    });
}

function createObstacles() {
    obstacles = [];
    for (let i = 0; i < 3; i++) {
        obstacles.push({
            x: Math.random() * 300,
            y: Math.random() * 300,
            width: 50,
            height: 20,
            dx: (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1)
        });
    }
}

function drawObstacles() {
    obstacles.forEach(obs => {
        ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
        obs.x += obs.dx;
        if (obs.x <= 0 || obs.x + obs.width >= canvas.width) {
            obs.dx *= -1;
        }
    });
}

function checkObstacleCollision() {
    for (let obs of obstacles) {
        if (x + 15 > obs.x && x - 15 < obs.x + obs.width &&
            y + 15 > obs.y && y - 15 < obs.y + obs.height) {
            endGame();
        }
    }
}

function update() {
    if (!gameOver) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (keys['ArrowUp'] || keys['w']) y -= speed;
        if (keys['ArrowDown'] || keys['s']) y += speed;
        if (keys['ArrowLeft'] || keys['a']) x -= speed;
        if (keys['ArrowRight'] || keys['d']) x += speed;

        if (x - 15 < 0) x = 15;
        if (x + 15 > canvas.width) x = canvas.width - 15;
        if (y - 15 < 0) y = 15;
        if (y + 15 > canvas.height) y = canvas.height - 15;

        // Bouncing effect for ball
let bounceScale = Math.sin(Date.now() / 120) * 2 + 28;
ctx.drawImage(ballImg, x - bounceScale/2, y - bounceScale/2, bounceScale, bounceScale);

        drawCoins();
        collectCoins();
        drawObstacles();
        checkObstacleCollision();

        timeLeft -= 1 / 60;
        if (timeLeft <= 0) endGame();

        scoreDisplay.textContent = "Score: " + score + " | Best: " + bestScore;
        timerDisplay.textContent = "Time: " + Math.ceil(timeLeft) + "s";

        requestAnimationFrame(update);
    }
}

function endGame() {
    gameOver = true;
    gameOverText.style.display = "block";
    restartBtn.style.display = "inline-block";
    gameOverSound.play();
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
    }
}

restartBtn.addEventListener('click', () => {
    x = 200; y = 200;
    score = 0;
    timeLeft = 30;
    gameOver = false;
    gameOverText.style.display = "none";
    restartBtn.style.display = "none";
    scoreDisplay.textContent = "Score: 0 | Best: " + bestScore;
    createCoins();
    createObstacles();
    update();
});

document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function pressKey(key) { keys[key] = true; }
function releaseKey(key) { keys[key] = false; }

document.getElementById('upBtn').addEventListener('touchstart', () => pressKey('ArrowUp'));
document.getElementById('upBtn').addEventListener('touchend', () => releaseKey('ArrowUp'));
document.getElementById('downBtn').addEventListener('touchstart', () => pressKey('ArrowDown'));
document.getElementById('downBtn').addEventListener('touchend', () => releaseKey('ArrowDown'));
document.getElementById('leftBtn').addEventListener('touchstart', () => pressKey('ArrowLeft'));
document.getElementById('leftBtn').addEventListener('touchend', () => releaseKey('ArrowLeft'));
document.getElementById('rightBtn').addEventListener('touchstart', () => pressKey('ArrowRight'));
document.getElementById('rightBtn').addEventListener('touchend', () => releaseKey('ArrowRight'));

createCoins();
createObstacles();
scoreDisplay.textContent = "Score: 0 | Best: " + bestScore;
update();

const splash = document.getElementById('splash');
const gameContainer = document.getElementById('gameContainer');
setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
        splash.style.display = 'none';
        gameContainer.style.display = 'block';
    }, 1000);
}, 3000);

// === Main Menu Logic ===
const mainMenu = document.getElementById('mainMenu');
const gameContainer = document.getElementById('gameContainer');
const startGameBtn = document.getElementById('startGameBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const instructions = document.getElementById('instructions');
const bgMusic = document.getElementById('bgMusic');

startGameBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    bgMusic.play();
    restartBtn.click();
});

howToPlayBtn.addEventListener('click', () => {
    instructions.style.display = instructions.style.display === 'none' ? 'block' : 'none';
});

// === Parallax Background Effect ===
let bgY = 0;
function drawParallaxBackground() {
    bgY += 0.5;
    if (bgY >= canvas.height) bgY = 0;
    let bgImg = new Image();
    bgImg.src = 'background.png';
    ctx.drawImage(bgImg, 0, bgY - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(bgImg, 0, bgY, canvas.width, canvas.height);
}

// Replace clearRect with parallax background in update()
const oldUpdate = update;
update = function customUpdate() {
    if (!gameOver) {
        drawParallaxBackground();
        if (typeof oldUpdate === 'function') oldUpdate();
    }
};


// === Loading Splash to Main Menu ===
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loadingScreen').style.display = 'none';
        mainMenu.style.display = 'flex';
    }, 2000); // 2-second splash
});

// === Fix Start Game Button to properly start game ===
startGameBtn.addEventListener('click', () => {
    mainMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    bgMusic.play();
    restartBtn.click(); // starts new game
});

// === Ensure game pauses when not in gameContainer ===
document.addEventListener('visibilitychange', () => {
    if (document.hidden && !gameOver) {
        gameOver = true;
        clearInterval(timerInterval);
    }
});

// === Extra Fail-Safe: Always move to main menu after 2.5s ===
setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen.style.display !== 'none') {
        loadingScreen.style.display = 'none';
        mainMenu.style.display = 'flex';
    }
}, 2500);
