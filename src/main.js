import Phaser from 'phaser'

// Importing scenes
import HelloWorldScene from './scenes/HelloWorldScene'
import GameScene from './scenes/GameScene'

// Creating config for phaser initialization
const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 300 }
		}
	},
	scene: [GameScene, HelloWorldScene]
}

// Initializing phaser and exporting it
export default new Phaser.Game(config)
