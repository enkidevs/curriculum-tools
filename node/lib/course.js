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
    console.log("sectionAndOrderWorkouts not implemented")
    // loop through each workout and attach parents to children
    // Assign the workout with no parent as this.sections[i].head
    // traverse the linked-list and put all the workouts in order in this.sections[i].workouts
  }

  renderCourse() {
    // @mihai, write a function that traverses the course in memory and returns as a markdown-formatted string:
    //  The course title as an H1
    //  each workout title
    //    the filename of each insight in the workout under each workout
    //    link the filename in markdown to the content path on github
  }

  readCourseTree() {
    // rearranges the workouts and insights within the course
    // optionally, take in a hash map of keys and values formatted like so:
    // {
    //   ":functions:" "tags.functions"
    // }
    // that would look for the string ":functions:" next to the insight, and would add the tag "functions" to the "tags" field.
  }

  writeCourseTree() {
    // modifies the files to match the current structure in memory by traversing the course and moving files to their correct workouts
    // put removed insights into the .archived folder
    // add any metadata that doesn't currently
  }

}
