let ContentReader = require('./contentReader');
let yaml = require("js-yaml");

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

  parse(text) {
    yaml.safeLoadAll(text.split("---")[0], (doc)=>{
      for (var prop in doc) {
        this[prop] = doc[prop];
      }
    })
  }

  addInsight(insight) {
    //replaces the insight in the array of slugs
    let idx = this.insights.indexOf(insight.slug)
    this.insights[idx] = insight;
  }

  render() {
    //this should produce the readme.md file that defines the workout
  }

  getStats() {
    let stats = {
      practiceQuestions: 0,
      revisionQuestions: 0,
      quizQuestions: 0,
      stubs: 0,
      insights: 0,
      standards: 0
    }
    for (let insight of this.insights) {
      stats.insights++;
      if (!insight.content || insight.stub) stats.stubs++
      if (!insight.practiceQuestion || !insight.revisionQuestion) {
        console.log("found unparsed insight");
        continue;
      }
      if (insight.practiceQuestion.text) stats.practiceQuestions++;
      if (insight.revisionQuestion.text) stats.revisionQuestions++;
    }

    if (stats.revisionQuestions > 1) stats.placementTestReady = true;

    return stats;
  }
}
