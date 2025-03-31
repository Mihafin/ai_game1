import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Создаем градиентный фон
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a237e, 0x0d47a1, 0x1a237e, 0x0d47a1);
    graphics.fillRect(0, 0, 800, 600);

    // Создаем группу для звезд
    this.stars = this.add.group();
    
    // Добавляем начальные звезды
    for (let i = 0; i < 50; i++) {
      this.createStar();
    }

    // Запускаем анимацию звезд
    this.time.addEvent({
      delay: 2000,
      callback: this.animateStars,
      callbackScope: this,
      loop: true
    });

    // Заголовок с тенью
    const titleShadow = this.add.text(402, 202, 'Моя Игра', {
      fontSize: '64px',
      fill: '#000',
      alpha: 0.3
    }).setOrigin(0.5);

    const title = this.add.text(400, 200, 'Моя Игра', {
      fontSize: '64px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Кнопка "Играть" с эффектами
    const playButton = this.add.text(400, 400, 'Играть', {
      fontSize: '32px',
      fill: '#fff',
      backgroundColor: '#2196f3',
      padding: { x: 30, y: 15 },
      borderRadius: 10
    })
    .setOrigin(0.5)
    .setInteractive()
    .setShadow(2, 2, '#000', 2);

    // Эффекты при наведении
    playButton.on('pointerover', () => {
      playButton.setStyle({ 
        fill: '#fff',
        backgroundColor: '#1976d2'
      });
      playButton.setScale(1.1);
      this.tweens.add({
        targets: playButton,
        scale: 1.1,
        duration: 100
      });
    });

    playButton.on('pointerout', () => {
      playButton.setStyle({ 
        fill: '#fff',
        backgroundColor: '#2196f3'
      });
      playButton.setScale(1);
      this.tweens.add({
        targets: playButton,
        scale: 1,
        duration: 100
      });
    });

    // Обработка клика
    playButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    // Анимация появления сцены
    this.cameras.main.fadeIn(1000);

    this.cursors = this.input.keyboard.createCursorKeys();
    
    console.log('Create completed');
  }

  createStar() {
    const x = Phaser.Math.Between(0, 800);
    const y = Phaser.Math.Between(0, 600);
    const size = Phaser.Math.Between(1, 3);
    const star = this.add.circle(x, y, size, 0xffffff, 0.5);
    this.stars.add(star);
    return star;
  }

  animateStars() {
    // Удаляем 5 случайных звезд
    for (let i = 0; i < 5; i++) {
      const stars = this.stars.getChildren();
      if (stars.length > 0) {
        const randomStar = stars[Phaser.Math.Between(0, stars.length - 1)];
        this.tweens.add({
          targets: randomStar,
          alpha: 0,
          duration: 1000,
          onComplete: () => {
            randomStar.destroy();
          }
        });
      }
    }

    // Создаем 5 новых звезд
    for (let i = 0; i < 5; i++) {
      const newStar = this.createStar();
      newStar.alpha = 0;
      this.tweens.add({
        targets: newStar,
        alpha: 0.5,
        duration: 1000
      });
    }
  }

  update() {
    if (this.cursors.space.isDown) {
      this.scene.start('GameScene');
    }
  }
} 