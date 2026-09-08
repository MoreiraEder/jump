var scene = {
  canvas: document.getElementById("scene"),
  frameNumber: 0,
  nextEnemyFrame: 50, // First frame to a enemy pop-up
  intervalId: 0,
  score: 0,
  fistTime: true,
  isPlaying: false,
  player: new Player(),
  enemyList: [],
  hud: new Hud(),
}

const FALL_GRAVITY = 0.9;
const JUMP_FORCE = 1.6;
const LEVEL_LIST = [3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597];

const PLAY = new Image(48, 48);
PLAY.src = 'assets/play.png'
const REPLAY = new Image(48, 48);
REPLAY.src = 'assets/replay.png'

const ENEMY_BW = new Image(40, 31);
ENEMY_BW.src = 'assets/enemy-bw.png';
const CHICKEN = new Image(41, 50);
CHICKEN.src = 'assets/chicken.png';
const ENEMY = new Image(40, 31);
ENEMY.src = 'assets/enemy.png';

let SPEED = 2.6;
let LEVEL = 0;

window.addEventListener('keydown', (e) => {
  if (e.key == ' ' || e.key == 'Enter' || e.key == 'ArrowUp') {
    action();
  }
});
window.addEventListener('keyup', (e) => {
  if (e.key == ' ' || e.key == 'Enter'  || e.key == 'ArrowUp') {
    fall();
  }
});
window.addEventListener('touchstart', () => {
  action();
});
window.addEventListener('touchend', () => {
  fall();
});
window.addEventListener('mousedown', () => {
  action();
});
window.addEventListener('mouseup', () => {
  fall();
});

function firstRender() {
  scene.canvas.width = 480;
  scene.canvas.height = 270;
  scene.hud.render();
}

function startGame() {
  scene.player.gravity = FALL_GRAVITY;
  scene.intervalId = setInterval(gameLoop, 16.6666);
  scene.isPlaying = true;
  scene.fistTime = false;
  scene.enemyList.splice(0);
  scene.player.y = 120;
  scene.frameNumber = 0;
  scene.nextEnemyFrame = 50;
  scene.score = 0;
  SPEED = 2.6;
  LEVEL = 0;
}

function action() {
  if (scene.isPlaying) {
    jump();
  } else {
    startGame();
  }
}

function Hud() {
  this.render = function render() {
    const context = scene.canvas.getContext('2d');

    if (scene.fistTime && !scene.isPlaying) {
      scene.canvas.getContext("2d").drawImage(PLAY, 208, 103, 64, 64);
    } else {
      context.font = '24px Consolas';
      context.fillStyle = 'black';
      context.fillText(`x ${scene.score}`, 400, 40);
      scene.canvas.getContext("2d").drawImage(ENEMY_BW, 354, 15, 40, 31);

      let stars = '';
      for (let i = 0; i < LEVEL; i++) {
        stars = stars + '*';
      }
      context.fillText(stars, 448 - (11 * LEVEL), 64);

      if (!scene.isPlaying) {
        scene.canvas.getContext("2d").drawImage(REPLAY, 208, 103, 64, 64);
      }
    }
  }
}

function Player() {
  this.isJumping = false;
  this.width = 41;
  this.height = 50;
  this.x = 50; // Start position
  this.y = 120; // Start position
  this.gravity = 0;
  this.gravitySpeed = 0;
  this.render = function () {
    scene.canvas.getContext("2d").drawImage(CHICKEN, this.x, this.y, this.width, this.height);
  }
  this.update = function () {
    this.gravitySpeed += this.gravity;
    this.y += this.gravitySpeed;
    this.hitBottom();
    if (this.y < scene.canvas.height * 0.6) {
      fall();
    }
  }
  this.hitBottom = function () {
    var rockBottom = scene.canvas.height - this.height;
    if (this.y > rockBottom) {
      this.y = rockBottom;
      this.gravitySpeed = 0;
      this.isJumping = false;
    }
  }
  this.testCrash = function testCrash(enemy) {
    const myLeft = this.x + 5;
    const myRight = this.x + (this.width - 10);
    // const myTop = this.y;
    const myBottom = this.y + (this.height - 5);
    const enemyLeft = enemy.x + 2;
    const enemyRight = enemy.x + (enemy.width - 2);
    const enemyTop = enemy.y + 3;
    // const enemyBottom = enemy.y + enemy.height;
    return !(/* (myTop > enemyBottom) || */ (myBottom < enemyTop) || (myRight < enemyLeft) || (myLeft > enemyRight));
  }
}

function Enemy() {
  this.passed = false;
  this.width = 40;
  this.height = 31;
  this.x = scene.canvas.width;
  this.y = scene.canvas.height - this.height;
  this.render = function () {
    scene.canvas.getContext("2d").drawImage(ENEMY, this.x, this.y, this.width, this.height);
    if (!this.passed && (this.x + this.width) < scene.player.x) {
      this.passed = true;
      scene.score += 1;
    }
  }
}

function gameLoop() {
  for (i = 0; i < scene.enemyList.length; i++) {
    if (scene.player.testCrash(scene.enemyList[i])) {
      clearInterval(scene.intervalId);
      setTimeout(() => {
        scene.isPlaying = false;
        scene.hud.render();
      }, 1000);
    }
  }
  scene.canvas.getContext('2d').clearRect(0, 0, scene.canvas.width, scene.canvas.height);
  scene.frameNumber += 1;

  if (scene.frameNumber > scene.nextEnemyFrame) {
    const minFrameDistance = 50;
    const maxFrameDistance = 220; // Actually, the maxFrameDistance would be this plus minFrameDistance
    scene.nextEnemyFrame = scene.frameNumber + Math.trunc((Math.random() * maxFrameDistance) + minFrameDistance);
    scene.enemyList.push(new Enemy());
    if (scene.enemyList.length > 0 && scene.enemyList[0].x + scene.enemyList[0].width < 0) {
      scene.enemyList.splice(0, 1);
    }
  }
  for (i = 0; i < scene.enemyList.length; i++) {
    scene.enemyList[i].x -= SPEED;
    scene.enemyList[i].render();
  }

  if (scene.score > LEVEL_LIST[LEVEL] && LEVEL < 11) {
    LEVEL += 1;
    SPEED = SPEED * 1.3333;
  }

  scene.hud.render();
  scene.player.update();
  scene.player.render();
}

function jump() {
  if (!scene.player.isJumping) {
    scene.player.isJumping = true;
    scene.player.gravity = -JUMP_FORCE;
  }
}

function fall() {
  scene.player.gravity = FALL_GRAVITY;
}
