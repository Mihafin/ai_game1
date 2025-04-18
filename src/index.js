import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: [MenuScene, GameScene],
  plugins: {
    scene: [
      {
        key: 'Particles',
        plugin: Phaser.GameObjects.Particles.ParticleEmitterManager,
        mapping: 'particles'
      }
    ]
  }
};

const game = new Phaser.Game(config); 