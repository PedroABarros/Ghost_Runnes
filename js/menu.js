// Classe Button
class Button {
  constructor(scene, x, y, width, height, text, callback) {
    this.scene = scene;
    this.callback = callback;

    this.background = scene.add.rectangle(x, y, width, height, 0x4a4a6a);
    this.background.setInteractive();
    this.background.setStrokeStyle(2, 0xffc800);

    this.textObj = scene.add
      .text(x, y, text, {
        font: "bold 24px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    this.background.on("pointerover", () => {
      this.background.setFillStyle(0x6a6a9a);
    });

    this.background.on("pointerout", () => {
      this.background.setFillStyle(0x4a4a6a);
    });

    this.background.on("pointerdown", () => {
      this.callback();
    });
  }
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image(
      "background",
      "assets/destruicao-apocaliptica-da-paisagem-da-zona-de-guerra_23-2150985663.avif"
    );
    this.load.audio(
      "menuMusic",
      "musics/horror-background-atmosphere-for-suspense-166944.mp3"
    );
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.add
      .image(centerX, centerY, "background")
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.3
    );

    const title = this.add
      .text(centerX, centerY - 200, "Ghost_Runners", {
        font: "bold 80px Arial",
        fill: "#00ff00",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: centerY - 180,
      duration: 2000,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Estado da música
    this.isMusicOn = localStorage.getItem("musicEnabled") !== "false";

    this.backgroundMusic = this.sound.add("menuMusic", {
      loop: true,
      volume: 0.5,
    });

    if (this.isMusicOn) {
      this.backgroundMusic.play();
    }

    // PLAY
    new Button(this, centerX, centerY - 20, 200, 50, "PLAY", () => {
      if (this.backgroundMusic) this.backgroundMusic.stop();
      window.location.href = "game.html";
    });

    // ===== BOTÃO DE MÚSICA =====
    const musicText = this.isMusicOn ? "🔊 MÚSICA ON" : "🔇 MÚSICA OFF";

    this.musicButton = new Button(
      this,
      centerX,
      centerY + 60,
      200,
      50,
      musicText,
      () => {
        this.toggleMusic();
      }
    );
  }

  toggleMusic() {
    this.isMusicOn = !this.isMusicOn;
    localStorage.setItem("musicEnabled", this.isMusicOn);

    if (this.isMusicOn) {
      this.backgroundMusic.resume();
      this.musicButton.textObj.setText("🔊 MÚSICA ON");
    } else {
      this.backgroundMusic.pause();
      this.musicButton.textObj.setText("🔇 MÚSICA OFF");
    }
  }
}

// Cena do Jogo
class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.audio(
      "gameMusic",
      "musics/horror-background-atmosphere-06-199279.mp3"
    );
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x1a1a2e
    );

    this.add
      .text(centerX, centerY - 100, "JOGO", {
        font: "bold 48px Arial",
        fill: "#ffc800",
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 100, "Pressione ESC para voltar", {
        font: "24px Arial",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    const musicEnabled = localStorage.getItem("musicEnabled") !== "false";

    this.gameMusic = this.sound.add("gameMusic", { loop: true, volume: 0.2 });

    if (musicEnabled) this.gameMusic.play();

    this.input.keyboard.on("keydown-ESC", () => {
      this.sound.stopAll();
      window.location.href = "index.html";
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: "game",
  backgroundColor: "#1a1a2e",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [MenuScene, GameScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
