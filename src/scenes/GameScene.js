import Phaser from 'phaser'
import ScoreLabel from '../ui/ScoreLabel'
import Timer from '../ui/Timer'
import BestTimeInRound from '../ui/BestTimeInRound'
import BombSpawner from './BombSpawner'

// Defining names in variables to keep code dry
const GROUND_KEY = 'ground'
const DUDE_KEY = 'dude'
const STAR_KEY = 'star'
const BOMB_KEY = 'bomb'


export default class GameScene extends Phaser.Scene {
	constructor() {
		super('game-scene')

		// defining properties which will be reassigned later
        this.cursors = undefined;
        this.player = undefined;
		this.scoreLabel = undefined;
		this.stars = undefined;
		this.bombSpawner = undefined;
		this.gameOver = false;
		this.timer = undefined;

		// Creating like this gives us opportunity to easily add tripple or quadriple jump
		this.jumpCount = 0;
		this.maxJumpCount = 2; // 2 means double jump
	
		// tracking round
		this.round = 1;
	}

	// preload method is used to load assets needed for the game
	preload() {
		// Defining url from which we are getting assets, so we wont have to repeat it
		this.load.setBaseURL('http://labs.phaser.io')
		
		this.load.image('sky', '/assets/skies/background1.png')
		this.load.image(GROUND_KEY, '/assets/sprites/block.png')
		this.load.image("platform", '/assets/sprites/platform.png')
		this.load.image('star', '/assets/sprites/diamond.png')
		this.load.image(BOMB_KEY, "/assets/sprites/mine.png")

		this.load.spritesheet(DUDE_KEY, 
			'/assets/sprites/dude.png',
			{ frameWidth: 32, frameHeight: 48 }
		)
	}

	// Create function runs once after loading, here you create everything that is needed for game
	create() {
		this.add.image(400, 300, 'sky') // Adding sky backround

		this.round = 1; // this used to reset round after restarting game
		
		// creating objects and texts
		const platforms = this.createPlatforms()
		this.player = this.createPlayer()
		this.stars = this.createStars()

		this.addRestartButton();

		this.scoreLabel = this.createScoreLabel(16, 16, 0)
		
		this.timer = this.createTimer(16, 60, 0);

		this.bombSpawner = new BombSpawner(this, BOMB_KEY)
		const bombsGroup = this.bombSpawner.group

		this.bestRoundTime = this.createBestRoundTime(16, 90);


		// adding colliders 
		this.physics.add.collider(this.player, platforms)
		this.physics.add.collider(this.stars, platforms)
		this.physics.add.collider(bombsGroup, platforms)

		// on bomb bollider we also add callback
		this.physics.add.collider(this.player, bombsGroup, this.hitBomb, null, this)	

		// we add overlaping to player and point and handling it by callback
		this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)

		// saving cursors
		this.cursors = this.input.keyboard.createCursorKeys()
	}

	// update run in loop keeping game going
	update() {
		// checking for key press and playing animations
		if (this.cursors.left.isDown) {
			this.player.setVelocityX(-160 )

			this.player.anims.play('left', true)
		}

		else if (this.cursors.right.isDown) {
			this.player.setVelocityX(160)

			this.player.anims.play('right', true)
		}

		else {
			this.player.setVelocityX(0)

			this.player.anims.play('turn')
		}

		// Just down function checks if key was just pressed
		// If we watched just keydown it would result a lot of triggers
		const isJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up);

		if (isJustDown) {
			// Normal jump from ground/object
			if (this.player.body.touching.down) {
				this.jumpCount = 1;
				
				this.player.setVelocityY(-330);
			}
			
			// Extra jump in air
			else if (this.jumpCount < this.maxJumpCount) {
				this.jumpCount++;

				this.player.setVelocityY(-330)
			}
		}
	}


	///////////////////////////////////////////////////

	// creating platform objects
	createPlatforms() {
		// every object in this group will be static
		const platforms = this.physics.add.staticGroup()

		const { width, height } = this.sys.game.canvas; // taking game screen size 

		// creating platform 
		platforms.create(0, height, "platform").setSize(2000, 50).setScale(5, 1)

		// creating boxets
		platforms.create(350, 470, GROUND_KEY).refreshBody()
		platforms.create(600, 400, GROUND_KEY)
		platforms.create(50, 400, GROUND_KEY)
		platforms.create(750, 220, GROUND_KEY)

        return platforms;
	}

	// creating player object
	createPlayer() {
		// creating player
		const player = this.physics.add.sprite(100, 450, DUDE_KEY)
		
		// setting bouncyness of player
		player.setBounce(0.2)

		// telling game that it should collide with game borders
		player.setCollideWorldBounds(true)

		// adding player animation to each key
		this.anims.create({
			key: 'left',
			frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 0, end: 3 }),
			frameRate: 10,
			repeat: -1
		})
		
		this.anims.create({
			key: 'turn',
			frames: [ { key: DUDE_KEY, frame: 4 } ],
			frameRate: 20
		})
		
		this.anims.create({
			key: 'right',
			frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 5, end: 8 }),
			frameRate: 10,
			repeat: -1
		})

		return player;
	}

	// used as callback whenever player hits enemy
	hitBomb(player, bomb) {
		// pausing physics which makes everything to stop moving
		this.physics.pause()

		player.setTint(0xff0000) // making player red

		// turning player towards us
		player.anims.play('turn')

		// stopping timer
		this.timer.stop();

		// marking game over
		this.gameOver = true;

		// displaying game over text with possibility to restart
		this.displayGameOver();
	}

	// gameover text when player dies
	displayGameOver() {
		// creating game over text
		const gameOverText = this.add.text(130, 170, "GAME OVER. CLICK TO RESTART", { fontSize: "30px" });

		// making interactive
		// this is needed to add event to it
		gameOverText.setInteractive();

		// adding click event to restart game
		gameOverText.on('pointerdown', () => this.scene.restart())
	}
	
	// used as callback whenever player collects point
	collectStar(player, star) {
		// removing point object
		// first parameter is for disabling object
		// second for hiding object
		star.disableBody(true, true);

		// incrementing score
		this.scoreLabel.add(10);

		// checking if collected all stars
		if (this.stars.countActive(true) === 0) {
			// stopping timer
			this.timer.stop();

			// pausing game between rounds
			this.scene.pause();

			// checking if time used to complete round was best
			this.bestRoundTime.shouldUpdateBestTime(this.timer.getTime(), this.round);

			// update best round text to match next round
			this.bestRoundTime.update(++this.round);
			
			// displaying which round is it
			this.displayRoundText(this.round);

			// in 2 second we continue game
			setTimeout(() => {
				// resuming game
				this.scene.resume();
				
				// resuming timer
				this.timer.start();

				// re-enabling points to gether again
				this.stars.children.iterate(child => {
					child.enableBody(true, child.x, 0, true, true)
				})
			}, 2000)

		}

		// Spawning enemy on every second point
		if (this.stars.countActive(true)%2 === 0) {
			this.bombSpawner.spawn(player.x)
		}
	}


	createStars() {
		// creating points to collect
		const stars = this.physics.add.group({
			key: STAR_KEY,
			repeat: 11, // repeats 11 times, creating 12 points
			setXY: { x: 12, y: 0, stepX: 70 }
		})
		
		// randomly set bounciness of every point, so whenever they hit ground they ricochet on different heights
		stars.children.iterate((child) => {
			child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
		})

		return stars
	}

	createScoreLabel(x, y, score) {
		// creating text for score
		const style = { fontSize: '32px', fill: '#000' }
		const label = new ScoreLabel(this, x, y, score, style)

		// adding object to game to display
		this.add.existing(label)

		return label
	}

	createTimer(x, y, score) {
		// Creating text for timer
		const style = { fontSize: '16px', fill: '#000' }
		const label = new Timer(this, x, y, score, style)

		// Staring timer
		label.start();

		// adding object to game to display
		this.add.existing(label)

		return label
	}

	createBestRoundTime(x, y) {
		// Creating text to identify best time in current round
		const style = { fontSize: '16px', fill: '#000' }
		const label = new BestTimeInRound(this, x, y, "Round 1 Best: ", style)

		// initializing with round 1
		label.update(1);

		// adding object to game to display
		this.add.existing(label)

		return label
	}

	addRestartButton() {
		// Adding restart button text
		const helloButton = this.add.text(700, 25, 'restart', { color: "red" });
		
		// Making it interactive
		helloButton.setInteractive(); 
	
		// Adding keydown event which restarts scene
		helloButton.on('pointerdown', () => this.scene.restart())
	}

	displayRoundText(round) {
		// Creating round identifier text
		const text = this.add.text(345, 170, `ROUND ${round}`, { fontSize: "38px" });
		
		// removing that text in 2 seconds
		setTimeout(() => text.destroy(), 1900);
	}
}