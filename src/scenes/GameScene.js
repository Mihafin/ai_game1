import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    console.log('Preload started');
    this.load.image('ground', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=');
    this.load.spritesheet('player_sheet', 'assets/player_sheet.png', {
      frameWidth: 16, 
      frameHeight: 16
    });
    console.log('Preload completed');
  }

  create() {
    console.log('Create started');

    // Создаем теплый зеленый фон
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
    this.platforms.create(400, 568, 'ground').setScale(800, 40).refreshBody().setTint(0x00ff00);
    this.platforms.create(600, 400, 'ground').setScale(200, 20).refreshBody().setTint(0x00ff00);
    this.platforms.create(80, 350, 'ground').setScale(200, 20).refreshBody().setTint(0x00ff00);
    this.platforms.create(750, 220, 'ground').setScale(200, 20).refreshBody().setTint(0x00ff00);

    this.player = this.physics.add.sprite(100, 450, 'player_sheet'); 
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
    for (let i = 5; i < 7; i++) {
      const coin = this.add.circle(12 + i * 70, 0, 8, 0xffff00);
      this.physics.add.existing(coin);
      coin.body.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      this.coins.add(coin);
    }

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

    this.cameras.main.fadeIn(1000);
    this.cursors = this.input.keyboard.createCursorKeys();
    
    console.log('Create completed');
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

  collectCoin(player, coin) {
    coin.destroy();
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    this.playCoinSound();
    console.log('Coin collected! Score:', this.score);
  }
} 