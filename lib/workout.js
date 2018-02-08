let ContentReader = require('./contentReader');
let yaml = require("js-yaml");

/**
 * Given a workout path, creates a Workout object
 * @param {string} filepath
 * @class
 * @extends ContentWriter
 */
module.exports = class Workout extends ContentReader {
  constructor(path){
    super(path)
    this.insights = [];
    this.section = null;
    this.course = null;
    this.topic = null;
    this.parent = null;
    this.slug = this.contentPath.split("/").slice(-2)[0];
    try {
      this.parse(this.rawText);
    } catch(err) {
      console.error(`Problem with ${this.contentPath}`)
    }
  }

/**
 * Take text of a Workout and return an object representing it
 * @param {string} Text of Workout file
 */
  parse(text) {
    var exerciseArr = text.split('---');
    var data = yaml.safeLoad(exerciseArr.shift());

    data.exercises = exerciseArr.map((exercise)=> {
      // Destructuringly assigning data into metadata and question
      var [exerciseMetadata, question] = exercise.split("### Question\n").map(x => {return x.trim()});
      exerciseMetadata = yaml.safeLoad(exerciseMetadata);

      return {...exerciseMetadata, question};
    })
    return data;
  }

  addInsight(insight) {
    //replaces the insight in the array of slugs
    let idx = this.insights.indexOf(insight.slug)
    this.insights[idx] = insight;
  }


/**
 * Generates markdown based on current object properties
 * @returns {string} Markdown
 */
  render() {
    var markdown = "";
    // Name
    if (this.name != null) markdown+= `name: ${this.name}\n\n`

    // Type
    if (this.type != null) markdown+= `type: ${this.type}\n\n`

    // Description
    if (this.description != null) markdown+= `description: ${this.description}\n\n`

    // Section
    if (this.section != null) markdown+= `section: ${this.section}\n\n`

    // Parent
    if (this.parent != null) markdown+= `parent: ${this.parent}\n\n`

    // Insight List
    if (this.insights != null && this.insights.length > 0) {
      markdown+= `insights:\n`
      for (var i in this.insights) {
        markdown += ` - ${this.insights[i]}\n`
      }
      markdown+= "\n"
    }

    return markdown;
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
