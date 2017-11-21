let ContentReader = require('./contentReader');
let yaml = require('js-yaml');
let path = require('path');

module.exports = class Course extends ContentReader {
  constructor (text) {
    super(text)

    this.topic = null;
    this.workouts = [];
    this.standards = [];
    this.sections = {};
    this.parse(this.rawText);
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

  render() {
    // this should produce the text for the readme file that defines this course
  }

  renderCourse(filter) {
    // @mihai, write a function that traverses the course in memory and returns as a markdown-formatted string:
    //  The course title as an H1
    //  table containing: Workout name | Insight slug (with link to location) | Status
    const branch = this.git.getGitBranch();

    const markdown = this.workouts.reduce((md, workout, ind) => {

      const wantedInsights = filter ? workout.insightsAsObj.filter(insight => filter(insight))
        : workout.insightsAsObj;

      const links = wantedInsights.reduce((acc, insight) => {
        const link = this.git.getInsightURL(branch, insight.contentPath.split('curriculum/')[1]);
        return acc + `${workout.name} | [${path.basename(insight.contentPath)}](${link}) | ${insight.stub ? 'stub' : 'live'}\n`;
      }, '');

      return md + `${links}`;
    }, '');
    return markdown.length ? `\n# ${this.title}\n\nWorkout | Insight | Status\n--- | --- | ---\n${markdown}` : '';
  }

  readCourseTree(text, map={}) {
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

  setGit(git) {
    this.git = git;
  }

}
