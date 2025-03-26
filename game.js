const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 640;

// Load sprites
const pugIdle = new Image();
pugIdle.src = "./assets/pug_idle.png";

const pugRun = new Image();
pugRun.src = "./assets/pug_run.png";

const pugHurt = new Image();
pugHurt.src = "./assets/pug_hurt.png";

let currentSprite = pugIdle;

let player = {
  x: 50,
  y: canvas.height / 2,
  width: 48,
  height: 48,
  velocity: 0,
  gravity: 0.6,
  jumpStrength: -10,
  state: "idle", // "idle", "run", "hurt"
};

let obstacles = [];
let gameSpeed = 3;
let score = 0;
let isGameOver = false;
let frames = 0;

function jump() {
  if (!isGameOver) {
    player.velocity = player.jumpStrength;
    player.state = "run";
    currentSprite = pugRun;
  } else {
    resetGame();
  }
}

function drawPlayer() {
  ctx.drawImage(currentSprite, player.x, player.y, player.width, player.height);
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.velocity += player.gravity;
  player.y += player.velocity;

  // Switch to idle if falling
  if (player.velocity > 1 && player.state !== "hurt") {
    currentSprite = pugIdle;
    player.state = "idle";
  }

  // Ground or top collision
  if (player.y + player.height > canvas.height || player.y < 0) {
    endGame();
  }

  // Obstacles
  for (let i = 0; i < obstacles.length; i++) {
    let obs = obstacles[i];
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
    let height = Math.random() * 200 + 50;
    obstacles.push({
      x: canvas.width,
      y: canvas.height - height,
      width: 40,
      height: height
    });
  }

  if (obstacles.length && obstacles[0].x + obstacles[0].width < 0) {
    obstacles.shift();
    score++;
  }

  drawPlayer();

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 20, 30);

  frames++;
  if (!isGameOver) requestAnimationFrame(update);
}

function endGame() {
  isGameOver = true;
  player.state = "hurt";
  currentSprite = pugHurt;

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
  obstacles = [];
  score = 0;
  frames = 0;
  isGameOver = false;
  update();
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") jump();
});

document.addEventListener("click", () => {
  jump();
});

update();
