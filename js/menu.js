// Classe Button - Botão interativo
class Button {
    constructor(scene, x, y, width, height, text, callback) {
        this.scene = scene;
        this.callback = callback;
        
        // Criar fundo do botão
        this.background = scene.add.rectangle(x, y, width, height, 0x4a4a6a);
        this.background.setInteractive();
        this.background.setStrokeStyle(2, 0xffc800);
        
        // Criar texto
        this.textObj = scene.add.text(x, y, text, {
            font: 'bold 24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Eventos
        this.background.on('pointerover', () => {
            this.background.setFillStyle(0x6a6a9a);
        });
        
        this.background.on('pointerout', () => {
            this.background.setFillStyle(0x4a4a6a);
        });
        
        this.background.on('pointerdown', () => {
            this.callback();
        });
    }
}

// Cena do Menu
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }
    
    preload() {
        // Carregar imagem de fundo
        this.load.image('background', 'assets/destruicao-apocaliptica-da-paisagem-da-zona-de-guerra_23-2150985663.avif');
        // Carregar músicas
        this.load.audio('menuMusic', 'musics/horror-background-atmosphere-for-suspense-166944.mp3');
    }
    
    create() {
        console.log('🎮 Menu Iniciado');
        
        // Fundo com imagem (usar coordenadas do centro da câmera)
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        this.add.image(centerX, centerY, 'background').setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        
        // Overlay escuro para melhor legibilidade do texto
        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.3);
        
        // Título animado em verde
        const title = this.add.text(centerX, centerY - 200, 'Ghost_Runners', {
            font: 'bold 80px Arial',
            fill: '#00ff00',
            align: 'center'
        }).setOrigin(0.5);
        
        // Animar título
        this.tweens.add({
            targets: title,
            y: centerY - 180,
            duration: 2000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        });
        
        // Variável para controlar música
        this.isMusicOn = true;
        this.backgroundMusic = null;
        
        // Botão PLAY
        new Button(this, centerX, centerY - 20, 200, 50, 'PLAY', () => {
            console.log('▶️ PLAY clicado');
            if (this.backgroundMusic) {
                this.backgroundMusic.stop();
            }
            // Redirecionar para a página que contém o jogo standalone
            window.location.href = 'game.html';
        });
        
        // Botão OPÇÕES
        new Button(this, centerX, centerY + 60, 200, 50, 'OPÇÕES', () => {
            console.log('⚙️ OPÇÕES clicado');
            this.showOptionsMenu();
        });
        
        // Botão MÚSICA
        this.musicButton = new Button(this, centerX, centerY + 140, 200, 50, '🔊 MÚSICA ON', () => {
            console.log('🔊 MÚSICA clicado');
            this.toggleMusic();
        });
        
        // Iniciar música
        this.backgroundMusic = this.sound.add('menuMusic', { loop: true, volume: 0.5 });
        this.backgroundMusic.play();
        console.log('♪ Música iniciada');
    }
    
    toggleMusic() {
        this.isMusicOn = !this.isMusicOn;
        
        if (this.isMusicOn) {
            this.backgroundMusic.resume();
            this.musicButton.textObj.setText('🔊 MÚSICA ON');
            console.log('✓ Música ligada');
        } else {
            this.backgroundMusic.pause();
            this.musicButton.textObj.setText('🔇 MÚSICA OFF');
            console.log('✓ Música desligada');
        }
    }
    
    showOptionsMenu() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // Overlay
        const overlay = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.5);
        overlay.setDepth(10).setInteractive();
        
        // Painel
        this.add.rectangle(centerX, centerY, 400, 250, 0x2a2a4a).setDepth(11).setStrokeStyle(3, 0xffc800);
        
        // Título
        this.add.text(centerX, centerY - 80, 'OPÇÕES', {
            font: 'bold 36px Arial',
            fill: '#ffc800'
        }).setOrigin(0.5).setDepth(12);
        
        // Texto
        this.add.text(centerX, centerY - 10, 'Volume: 50%', {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5).setDepth(12);
        
        // Botão Voltar
        new Button(this, centerX, centerY + 80, 150, 40, 'VOLTAR', () => {
            overlay.destroy();
        });
    }
}

// Cena do Jogo
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }
    
    preload() {
        // Carregar música do jogo
        this.load.audio('gameMusic', 'musics/horror-background-atmosphere-06-199279.mp3');
    }
    
    create() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x1a1a2e);
        this.add.text(centerX, centerY - 100, 'JOGO', {
            font: 'bold 48px Arial',
            fill: '#ffc800'
        }).setOrigin(0.5);
        
        this.add.text(centerX, centerY + 100, 'Pressione ESC para voltar', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Tocar música do jogo em volume baixo
        this.sound.play('gameMusic', { loop: true, volume: 0.2 });
        console.log('♪ Música do jogo iniciada (volume baixo)');
        
        this.input.keyboard.on('keydown-ESC', () => {
            this.sound.stopAll();
            // Redirecionar para a página externa do jogo
            window.location.href = 'game.html';
        });
    }
}

// Configuração e criação do jogo
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#1a1a2e',
    physics: { default: 'arcade' },
    scene: [MenuScene, GameScene],
    parent: 'game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: 'parent'
    }
};

const game = new Phaser.Game(config);
