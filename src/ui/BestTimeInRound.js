import Phaser from 'phaser'


export default class ScoreLabel extends Phaser.GameObjects.Text {
	constructor(scene, x, y, time, style) {
		super(scene, x, y, "", style);

        this.update(1);
	}

    update(round) {
        const bestInRound = localStorage.getItem(`round${round}`) ?? 0.00;

        this.setText(`Round ${round} Best: ${bestInRound}`);
    }

    shouldUpdateBestTime(time, round) {
        const currentBestTimeInRound = localStorage.getItem(`round${round}`) ?? null;

        if (currentBestTimeInRound === null || currentBestTimeInRound > time) {
            localStorage.setItem(`round${round}`, time.toFixed(2));
        }
    }
}