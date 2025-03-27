const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 640;

// Title screen
const titleImage = new Image();
titleImage.src = "./assets/Title.png";
let showTitle = true;

// Static background
const bgStatic = new Image();
bgStatic.src = "./assets/bg/bubk.png";

// Clouds
const cloudImage = new Image();
cloudImage.src = "./assets/bg/cloud.png";
let cloudX = 0;
let cloudSpeed = 0.5;

// Jump sound
const fartSound = new Audio("./assets/fart.mp3");
fartSound.volume = 0.6;

// Pug sprites
const pugIdle = new Image();
pugIdle.src = "./assets/pug/Pug_idle.png";

const pugRun1 = new Image();
pugRun1.src = "./assets/pug/pug_run_1.png";

const pugRun2 = new Image();
pugRun2.src = "./assets/pug/pug_run_2.png";

const pugHurt = new Image();
pugHurt.src = "./assets/pug/pug_hit.png";

let currentSprite = pugIdle;
let runFrame = 0;
let runTimer = 0;

let player = {
  x: 50,
  y: canvas.height / 2,
  width: 48,
  height: 48,
  velocity: 0,
  gravity: 0.6,
  jumpStrength: -10,
  state: "idle"
};

let bottomObstacles = [];
let topObstacles = [];
let gameSpeed = 3;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;
let isGameOver = false;
let frames = 0;
let level = 1;
const maxLevel = 30;

function jump() {
  if (!isGameOver) {
    fartSound.currentTime = 0;
    fartSound.play();
    let randomBoost = Math.random() * 4 - 2;
    player.velocity = player.jumpStrength + randomBoost;
    player.state = "run";
  } else {
    resetGame();
  }
}

function drawPlayer() {
  if (player.state === "run") {
    runTimer++;
    if (runTimer % 10 === 0) {
      runFrame = (runFrame + 1) % 2;
    }
    currentSprite = runFrame === 0 ? pugRun1 : pugRun2;
  }

  if (player.state === "idle") currentSprite = pugIdle;
  if (player.state === "hurt") currentSprite = pugHurt;

  if (currentSprite.complete && currentSprite.naturalHeight !== 0) {
    ctx.drawImage(currentSprite, player.x, player.y, player.width, player.height);
  } else {
    ctx.fillStyle = "#0f0";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Background
  ctx.drawImage(bgStatic, 0, 0, canvas.width, canvas.height);

  cloudX -= cloudSpeed;
  const cloudWidth = cloudImage.width;
  ctx.drawImage(cloudImage, cloudX, 0);
  ctx.drawImage(cloudImage, cloudX + cloudWidth, 0);
  if (cloudX <= -cloudWidth) cloudX = 0;

  // Gravity
  player.velocity += player.gravity;
  player.y += player.velocity;

  if (player.velocity > 1 && player.state !== "hurt") {
    player.state = "idle";
  }

  if (player.y + player.height > canvas.height || player.y < 0) {
    endGame();
  }

  // Bottom spikes
  for (let i = 0; i < bottomObstacles.length; i++) {
    let obs = bottomObstacles[i];
    obs.x -= gameSpeed;

    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      endGame();
    }

    ctx.fillStyle = "#f00";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  if (frames % 100 === 0) {
    let height = Math.random() * 200 + 150;
    bottomObstacles.push({
      x: canvas.width,
      y: canvas.height - height,
      width: 40,
      height: height
    });
  }

  if (bottomObstacles.length && bottomObstacles[0].x + bottomObstacles[0].width < 0) {
    bottomObstacles.shift();
    score++;

    if (score % 20 === 0 && level < maxLevel) {
      level++;
      gameSpeed *= 10;
    }
  }

  // Top spikes
  for (let i = 0; i < topObstacles.length; i++) {
    let obs = topObstacles[i];
    obs.x -= gameSpeed;

    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      endGame();
    }

    ctx.fillStyle = "#f00";
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  }

  if (frames % 120 === 0) {
    let height = Math.random() * 150 + 120;
    topObstacles.push({
      x: canvas.width,
      y: 0,
      width: 40,
      height: height
    });
  }

  if (topObstacles.length && topObstacles[0].x + topObstacles[0].width < 0) {
    topObstacles.shift();
  }

  drawPlayer();

  // Score and level
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Level: " + level, 20, 60);
  ctx.fillText("High Score: " + highScore, 20, 90);

  frames++;
  if (!isGameOver) requestAnimationFrame(update);
}

function endGame() {
  isGameOver = true;
  player.state = "hurt";
  currentSprite = pugHurt;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }

  ctx.fillStyle = "#fff";
  ctx.font = "40px Arial";
  ctx.fillText("Game Over", 120, canvas.height / 2);
  ctx.font = "20px Arial";
  ctx.fillText("Click or press SPACE to restart", 80, canvas.height / 2 + 40);
}

function resetGame() {
  player.y = canvas.height / 2;
  player.velocity = 0;
  player.state = "idle";
  currentSprite = pugIdle;
  bottomObstacles = [];
  topObstacles = [];
  score = 0;
  level = 1;
  gameSpeed = 3;
  frames = 0;
  isGameOver = false;
  update();
}

// Handle input
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (showTitle) {
      showTitle = false;
      update();
    } else {
      jump();
    }
  }
});

document.addEventListener("click", () => {
  if (showTitle) {
    showTitle = false;
    update();
  } else {
    jump();
  }
});

// Load everything
let imagesLoaded = 0;
[titleImage, bgStatic, cloudImage, pugIdle, pugRun1, pugRun2, pugHurt].forEach((img) => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 7) {
      ctx.drawImage(titleImage, 0, 0, canvas.width, canvas.height);
    }
  };
});
