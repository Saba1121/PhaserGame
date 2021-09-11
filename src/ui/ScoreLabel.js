import Phaser from 'phaser'

const formatScore = score => `Score: ${score}`

// Creating score label 
export default class ScoreLabel extends Phaser.GameObjects.Text {
	constructor(scene, x, y, score, style) {
		super(scene, x, y, formatScore(score), style)

		this.score = score
	}

	// method for setting new score
	setScore(score) {
		this.score  = score
		this.updateScoreText()
	}

	// method for adding points which calls setScore
	add(points) {
		this.setScore(this.score + points)
	}

	// method for updating objects text
	updateScoreText() {
		this.setText(formatScore(this.score))
	}
}