import Phaser from 'phaser'

const formatTime = time => `Current Round: ${time?.toFixed(2)}`;


// Timer label
export default class ScoreLabel extends Phaser.GameObjects.Text {
	constructor(scene, x, y, time, style) {
		super(scene, x, y, formatTime(time), style)

		this.time = 0;

        this.isTimerOn = false;
	}

    // recursively incrementing time in everying 100 millisecond
    incrementTime() {       
        setTimeout(() => {
            if (!this.isTimerOn) return;

            this.time += 0.1;

            this.setText(formatTime(this.time));

            this.incrementTime();
        }, 100)
    }

    // starting timer
    start() {
        this.time = 0;
        this.isTimerOn = true;

        this.incrementTime();
    }

    // method for getting currect round time
    getTime() {
        return this.time;
    }

    // stopping timer
    stop() {
        this.isTimerOn = false;
    }
}