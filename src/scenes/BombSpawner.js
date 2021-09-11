import Phaser from 'phaser'


// creating bombspawner
export default class BombSpawner
{
	/**
	 * @param {Phaser.Scene} scene
	 */

	constructor(scene, bombKey = 'bomb') {
		this.scene = scene
		this.key = bombKey

		this._group = this.scene.physics.add.group()
	}

	// getting group of enemies
	get group() {
		return this._group
	}

    spawn(playerX = 0) {
		// creates enemy on other half of map from player
		const x = (playerX < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)

        const bomb = this.group.create(x, 16, this.key)
        bomb.setBounce(1)

		// telling to collide with world borders
        bomb.setCollideWorldBounds(true)

		// gives random velocity 
		bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
		
		return bomb
	}
}