const yaml = require('js-yaml');
const Content = require('./content');
const { removeFalsy } = require('./helpers');

/**
 * Given a workout README and a path, creates a Workout object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Workout extends Content {
  constructor({ body, path }) {
    super({ body, path });
    this.name = '';
    this.insights = [];
    this.description = '';
    this.section = null;
    this.type = '';

    try {
      this.parse(this.rawText);
    } catch (err) {
      console.error(`Problem with ${this.contentPath}`);
    }

    // not currently in use:
    this.course = null;
    this.topic = null;
    this.parent = null;
  }

/**
 * Take text of a Workout and return an object representing it
 * @param {string} Text of Workout file
 */
  parse(text) {
<<<<<<< HEAD
    var exerciseArr = text.split('---');
    var data = yaml.safeLoad(exerciseArr.shift());

    data.exercises = exerciseArr.map((exercise)=> {
      // Destructuringly assigning data into metadata and question
      var [exerciseMetadata, question] = exercise.split("### Question\n").map(x => {return x.trim()});
      exerciseMetadata = yaml.safeLoad(exerciseMetadata);

      return {...exerciseMetadata, question};
    })
    return data;
=======
    yaml.safeLoadAll(text.split('---')[0], (doc) => {
      for (const prop in doc) {
        this[prop] = doc[prop];
      }
    });
>>>>>>> master
  }

  addInsight(insight) {
    // replaces the insight in the array of slugs
    let idx = this.insights.indexOf(insight.slug);

    this.insights[idx] = insight;
  }


  /**
   * Generates markdown based on current object properties
   * @returns {string} Markdown
   */
  render() {
    let markdown = '';

    // Name
    if (this.name != null) {
      markdown += `name: ${this.name}\n\n`;
    }
    // Type
    markdown += `type: ${this.type || 'insights-list'}\n\n`;
    // Description
    markdown += `description: ${this.description || 'todo'}\n\n`;
    // Section
    if (this.section != null) {
      markdown += `section: ${this.section}\n\n`;
    }
    // Parent
    if (this.parent != null) {
      markdown += `parent: ${this.parent}\n\n`;
    }
    // Insight List
    if (this.insights != null && this.insights.length > 0) {
      markdown += 'insights:\n';
      for (let i in this.insights) {
        markdown += ` - ${this.insights[i].slug}\n`;
      }
      markdown += '\n';
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
    };

    for (let insight of this.insights) {
      stats.insights++;
      if (!insight.content || insight.stub) {
        stats.stubs++;
      }
      if (!insight.practiceQuestion || !insight.revisionQuestion) {
        console.log(`Question missing for ${insight.contentPath}`);
        continue;
      }
      if (insight.practiceQuestion.text) {
        stats.practiceQuestions++;
      }
      if (insight.revisionQuestion.text) {
        stats.revisionQuestions++;
      }
    }

    if (stats.revisionQuestions > 1) {
      stats.placementTestReady = true;
    }

    return stats;
  }

  toJSON() {
    return removeFalsy({
      name: this.name,
      slug: this.slug,
      insights: this.insights,
      topic: this.topic,
      subtopic: this.subtopic,
      description: this.description,
      section: this.section,
      type: this.type,
      game: this.game
    });
  }
};
