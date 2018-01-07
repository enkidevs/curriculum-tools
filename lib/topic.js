let ContentReader = require('./contentReader')
let Course = require('./course')
let yaml = require('js-yaml')
let path = require('path')

module.exports = class Topic extends ContentReader {
  constructor (text) {
    super(text)
    this.courses = {};
    this.topicNamespace = null;
    this.standards = [];
    this.archived = [];
    this.parse(this.rawText);
  }

  parse(text) {
    if (text.length == 0) throw new Error("Passed empty Topic README");
    yaml.safeLoadAll(text.split("---")[0], (doc)=>{
      for (var prop in doc) {
        this[prop] = doc[prop];
      }
    })
  }

  setNamespace(namespace) {
    this.topicNamespace = namespace;
  }

  setGit(git) {
    this.git = git;
  }

  addStandard(standard) {
    this.standards.push(standard);
  }

  addCourse(course) {
    this.courses[course.title] = course;
    this.courses[course.title].setGit(this.git);
  }

  addArchivedInsights(insights) {
    this.archived = this.archived.concat(insights || []);
  }

  getInsights(filter,  { includeArchived = false } = {}) {
    const insights = Object.keys(this.courses).reduce((courses, course) =>
      courses.concat(this.courses[course].getInsights(filter)),
      []
    );
    return includeArchived ?  insights.concat(filter ? this.archived.filter(insight => filter(insight)) : this.archived)
      : insights;
  }

  renderArchived(filter) {
    const branch = this.git.getGitBranch();

    const wantedArchived = filter ? this.archived.filter(insight => filter(insight)) : this.archived;

    const markdown = wantedArchived.reduce((md, insight) => {
      const link = this.git.getInsightURL(branch, insight.contentPath.split('curriculum/')[1]);
      return md + `${insight.workoutName || 'N/A'} | [${path.basename(insight.contentPath)}](${link}) | ${insight.stub ? 'stub' : 'live'}\n`;
    }, '');

    return markdown.length ?
      `\n# Archived\n\nWorkout | Insight | Status\n--- | --- | ---\n${markdown}`
      : '';
  }

  renderCourses(filter, { includeArchived = false } = {}) {
    let markdown = '';
    Object.keys(this.courses).forEach(courseName => {
      markdown += this.courses[courseName].renderCourse(filter);
    });
    return includeArchived ? markdown + this.renderArchived(filter) : markdown;
  }


  render() {
    // this should produce the readme file that represents the topic
  }

  getStats(verbose) {
    let stats = {
      courses: 0
    };
    for (let key in this.courses) {
      console.log("Topic Get Stats: ", key)
      let courseStats = this.courses[key].getStats(verbose);
      if (!verbose && courseStats.workouts == 0) continue;
      stats.courses++;
      stats[key] = courseStats;
    }
    return stats;
  }
}
