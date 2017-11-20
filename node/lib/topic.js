let ContentReader = require('./contentReader')
let yaml = require('js-yaml')

module.exports = class Topic extends ContentReader {
  constructor (text) {
    super(text)
    this.courses = {};
    this.topicNamespace = null;
    this.standards = [];
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

  addStandard(standard) {
    this.standards.push(standard);
  }

  addCourse(course) {
    this.courses[course.title] = course;
  }

  getStubs() {
    return Object.keys(this.courses).reduce((courses, course) => {
      const courseStubs = this.courses[course].workouts.reduce((stubs, workout) => {
        stubs = stubs.concat(workout.insightsAsObj.filter(insight => insight.stub));

        return stubs;
      }, []);

      if(courseStubs.length) courses[course] = courseStubs;
      return courses;
    }, {});
  }

  renderCourses(filter) {
    let markdown = '';
    Object.keys(this.courses).forEach(courseName => {
      markdown += this.courses[courseName].renderCourse(filter) + '\n\n';
    });
    return markdown;
  }

  render() {
    // this should produce the readme file that represents the topic
  }
}
