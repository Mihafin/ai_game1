import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    console.log('MenuScene create started');

    // Инициализируем управление
    this.cursors = this.input.keyboard.createCursorKeys();

    // Создаем градиентный фон
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a237e, 0x0d47a1, 0x1a237e, 0x0d47a1);
    graphics.fillRect(0, 0, 800, 600);

    // Добавляем звезды
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const size = Phaser.Math.Between(1, 3);
      const star = this.add.circle(x, y, size, 0xffffff);
      
      // Анимация мерцания звезды
      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }

    // Создаем кнопку Play с анимацией
    const playButton = this.add.text(400, 300, 'Play', {
      fontSize: '64px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    })
    .setOrigin(0.5)
    .setInteractive()
    .setScale(1);

    // Анимация пульсации кнопки
    this.tweens.add({
      targets: playButton,
      scale: { from: 1, to: 1.1 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });

    // Обработчики событий кнопки
    playButton.on('pointerover', () => {
      playButton.setScale(1.1);
      playButton.setFill('#ffeb3b');
    });

    playButton.on('pointerout', () => {
      playButton.setScale(1);
      playButton.setFill('#fff');
    });

    playButton.on('pointerdown', () => {
      this.startGame();
    });

    // Добавляем текст с инструкциями
    this.add.text(400, 400, 'Press SPACE to start', {
      fontSize: '24px',
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    })
    .setOrigin(0.5);
    
    console.log('MenuScene create completed');

    // Анимация появления сцены
    this.cameras.main.fadeIn(1000);
  }

  update() {
    if (this.cursors && this.cursors.space.isDown) {
      this.startGame();
    }
  }

  startGame() {
    this.scene.start('GameScene', { levelPath: 'levels/level1.json' });
  }
} 