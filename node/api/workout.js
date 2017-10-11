'use strict';
const fs = require("fs");
const path = require('path');


class Workout {
	constructor(workout) {
		var w = this;
		const filePath = path.join(__dirname,workout);
		fs.readFile(filePath, 'utf-8', function(err, data) {
			if (!err) {
				w.content = data;
			}  else {
				console.log(err);
				process.exit(1);
			}
		})
		//parse raw text of workout file
		//has properties like...
		// an array of insight instances
	}
	getStats() {
		//return basic stats about workout
		//how many insights
		//how many practice questions
		//how many revision questions
		//how many games
	}
	getParent() {
		//return parent workout
	}
}


module.exports = Workout;