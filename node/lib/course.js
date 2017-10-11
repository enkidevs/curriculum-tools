let ContentReader = require('./contentReader');
let yaml = require('js-yaml');

module.exports = class Course extends ContentReader {
  constructor (text) {
    super(text)

    this.topic = null;
    this.workouts = [];
    this.standards = [];
    this.sections = {};
    this.parse(text);
  }

  parse(text) {
    if (text.length == 0) throw new Error("Passed in empty readme text");
    let parsed = yaml.safeLoad(text);
    if (parsed.sections) parsed.sections.forEach((s) => {this.sections[s] = []});
    this.description = parsed.description || "";
  }

  addWorkout(workout) {
    this.workouts.push(workout);
    this.sectionAndOrderWorkouts();
  }

  sectionAndOrderWorkouts() {
    console.log("sectionAndOrderWorkouts")
  }

}
