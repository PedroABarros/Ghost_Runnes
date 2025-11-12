var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

let player, stars, bombs, platforms, cursors;
let score = 0;
let gameOver = false;
let paused = false;
let scoreText;
let backgroundMusic;
let pauseMenu;

const game = new Phaser.Game(config);

function preload() {
  // --- IMAGENS ---
  this.load.image("sky", "assets/orig.png");
  this.load.image("ground", "assets/platform.png");
  this.load.image("star", "assets/star.png");
  this.load.image("bomb", "assets/bomb.png");

  // --- SPRITE DO PLAYER ---
  this.load.spritesheet("dude", "assets/player_run.png", {
    frameWidth: 128,
    frameHeight: 128,
  });

  // --- MÚSICA DO JOGO ---
  this.load.audio("gameMusic", "musics/horror-background-atmosphere-06-199279.mp3");
}

function create() {
  // --- FUNDO ---
  const bg = this.add.image(400, 300, "sky");
  bg.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

  // --- PLATAFORMAS ---
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  // --- PLAYER ---
  player = this.physics.add.sprite(100, 450, "dude");
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  // --- ANIMAÇÕES ---
  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });
  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  // --- CONTROLES ---
  cursors = this.input.keyboard.createCursorKeys();

  // --- ESTRELAS ---
  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate((child) => {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  // --- BOMBAS ---
  bombs = this.physics.add.group();

  // --- TEXTO DE SCORE ---
  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fill: "#000",
  });

  // --- COLISÕES ---
  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(player, bombs, hitBomb, null, this);

  // --- MÚSICA ---
  backgroundMusic = this.sound.add("gameMusic", { loop: true, volume: 0.3 });

// Verifica o estado global salvo
const savedMusicState = localStorage.getItem("musicEnabled");
const musicEnabled = savedMusicState === null ? true : savedMusicState === "true";

if (musicEnabled) {
    backgroundMusic.play();
    console.log("♪ Música do jogo iniciada");
} else {
    console.log("🔇 Música do jogo desativada (estado salvo)");
}

  // --- MENU DE PAUSA (criado e invisível) ---
  pauseMenu = createPauseMenu(this);
  pauseMenu.setVisible(false);

  // --- TECLA DE PAUSA ---
  this.input.keyboard.on("keydown-ESC", () => togglePause(this));
}

function update() {
  if (gameOver || paused) return;

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("left", true);
    player.flipX = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("right", true);
    player.flipX = false;
  } else {
    player.setVelocityX(0);
    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-330);
  }
}

// --- COLETAR ESTRELAS ---
function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText("Score: " + score);

  if (stars.countActive(true) === 0) {
    stars.children.iterate((child) => {
      child.enableBody(true, child.x, 0, true, true);
    });

    const x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    const bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
}

// --- ACERTOU A BOMBA ---
function hitBomb(player, bomb) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play("turn");
  gameOver = true;
  if (backgroundMusic && backgroundMusic.isPlaying) backgroundMusic.stop();
}

/* ===============================
   FUNÇÕES DO MENU DE PAUSA
   =============================== */

function togglePause(scene) {
  if (gameOver) return;

  paused = !paused;

  if (paused) {
    scene.physics.pause();
    scene.anims.pauseAll();
    pauseMenu.setVisible(true);
  } else {
    scene.physics.resume();
    scene.anims.resumeAll();
    pauseMenu.setVisible(false);
  }
}

function createPauseMenu(scene) {
  const centerX = scene.cameras.main.centerX;
  const centerY = scene.cameras.main.centerY;
  const container = scene.add.container(centerX, centerY);

  // Fundo
  const overlay = scene.add.rectangle(0, 0, 400, 300, 0x000000, 0.7);
  overlay.setStrokeStyle(3, 0xffc800);

  // Título
  const title = scene.add
    .text(0, -100, "PAUSADO", { font: "bold 48px Arial", fill: "#ffc800" })
    .setOrigin(0.5);

  // Botão CONTINUAR
  const resumeBtn = makeButton(scene, 0, -20, "Continuar", () => togglePause(scene));

  // Botão SOM
  const soundBtn = makeButton(scene, 0, 50, "Som: ON", () => {
    if (backgroundMusic.isPlaying) {
      backgroundMusic.pause();
      soundBtn.setText("Som: OFF");
    } else {
      backgroundMusic.resume();
      soundBtn.setText("Som: ON");
    }
  });

  // Botão VOLTAR AO MENU
  const menuBtn = makeButton(scene, 0, 120, "Voltar ao Menu", () => {
    backgroundMusic.stop();
    window.location.href = "index.html";
  });

  container.add([overlay, title, resumeBtn, soundBtn, menuBtn]);
  container.setDepth(20);

  return container;
}

// --- Função auxiliar de botão ---
function makeButton(scene, x, y, text, callback) {
  const btn = scene.add
    .text(x, y, text, {
      font: "bold 28px Arial",
      fill: "#fff",
      backgroundColor: "#4a4a6a",
      padding: { x: 20, y: 10 },
    })
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  btn.on("pointerover", () => btn.setStyle({ backgroundColor: "#6a6a9a" }));
  btn.on("pointerout", () => btn.setStyle({ backgroundColor: "#4a4a6a" }));
  btn.on("pointerdown", callback);

  return btn;
}
