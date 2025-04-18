import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    if (!data || !data.levelPath) {
      console.error('No level path provided!');
      this.scene.start('MenuScene');
      return;
    }
    this.levelPath = data.levelPath;
  }

  preload() {
    console.log('Preload started');
    this.load.image('ground', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=');
    // Создаем текстуру для частиц
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();
    
    this.load.spritesheet('player_sheet', 'assets/player_sheet.png', {
      frameWidth: 16, 
      frameHeight: 16
    });
    this.load.json('levelData', this.levelPath);
    console.log('Preload completed');
  }

  create() {
    console.log('Create started');

    // Проверяем наличие данных уровня
    if (!this.cache.json.exists('levelData')) {
      console.error('Level data is missing!');
      this.scene.start('MenuScene');
      return;
    }

    const levelData = this.cache.json.get('levelData');

    // Создаем фон
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1976d2);
    graphics.fillRect(0, 0, 800, 600);

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      console.log('AudioContext initialized');
    } catch (e) {
      console.error('Web Audio API is not supported in this browser', e);
      this.audioContext = null;
    }

    this.platforms = this.physics.add.staticGroup();
    
    // Создаем платформы из JSON
    levelData.platforms.forEach(platform => {
      const platformObj = this.add.rectangle(
        platform.x,
        platform.y,
        platform.width,
        platform.height,
        parseInt(platform.color)
      );
      this.physics.add.existing(platformObj, true);
      this.platforms.add(platformObj);
    });

    // Создаем игрока из JSON
    this.player = this.physics.add.sprite(
      levelData.player.x,
      levelData.player.y,
      'player_sheet'
    );
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);

    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player_sheet', { start: 0, end: 0 }),
      frameRate: 5,
    });

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player_sheet', { start: 1, end: 2 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player_sheet', { start: 3, end: 3 }),
      frameRate: 5,
    });

    this.coins = this.add.group();
    
    // Создаем монеты из JSON
    levelData.coins.forEach(coin => {
      const coinObj = this.add.circle(
        coin.x,
        coin.y,
        coin.radius,
        parseInt(coin.color)
      );
      this.physics.add.existing(coinObj);
      coinObj.body.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      this.coins.add(coinObj);
    });

    this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { 
      fontSize: '32px', 
      fill: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    });

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.coins, this.platforms);

    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    
    console.log('Create completed');

    // Анимация появления сцены
    this.cameras.main.fadeIn(1000);
  }

  update() {
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
      this.playJumpSound();
    }

    if (this.player.body.touching.down) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
        this.player.flipX = true;
        this.player.anims.play('walk', true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
        this.player.flipX = false;
        this.player.anims.play('walk', true);
      } else {
        this.player.setVelocityX(0);
        this.player.anims.play('idle', true);
      }
    } else {
      this.player.anims.play('jump', true);
      if (this.cursors.left.isDown) {
         this.player.setVelocityX(-160);
         this.player.flipX = true;
      } else if (this.cursors.right.isDown) {
         this.player.setVelocityX(160);
         this.player.flipX = false;
      }
    }

    // Проверяем, все ли монеты собраны
    if (this.coins.countActive() === 0) {
      this.scene.start('MenuScene');
    }
  }

  playJumpSound() {
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  playCoinSound() {
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.1);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  createCoinParticles(x, y) {
    console.log('Creating particles at:', x, y);
    const particles = this.add.particles(0, 0, 'particle', {
      x: x,
      y: y,
      speed: { min: 100, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 8,
      blendMode: 'ADD',
      tint: 0xffff00,
      active: true
    });

    // Удаляем эмиттер после завершения анимации
    this.time.delayedCall(500, () => {
      particles.destroy();
    });
  }

  collectCoin(player, coin) {
    const coinX = coin.x;
    const coinY = coin.y;
    coin.destroy();
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    this.playCoinSound();
    this.createCoinParticles(coinX, coinY);
    console.log('Coin collected! Score:', this.score);
  }
} 