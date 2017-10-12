let ContentReader = require('./contentReader');


module.exports = class Workout extends ContentReader {
  constructor(text){
    super(text)
    this.insights = [];
    this.section = null;
    this.course = null;
    this.topic = null;
    this.practiceQuestions = [];
    this.revisionQuestions = [];
    this.parent = null;
    this.slug = null;
    this.parse(text);
  }

  parse() {
    console.log("workout parse unimplemented")
  }

  addInsight() {

  }

  render() {
    //this should produce the readme.md file that defines the workout
  }
}
