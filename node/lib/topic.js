let ContentReader = require('./contentReader')
let yaml = require('js-yaml')

module.exports = class Topic extends ContentReader {
  constructor (text) {
    super(text)
    this.courses = {};
    this.topicNamespace = null;
    this.standards = [];
    this.parse(text);
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
    this.standards.push(standard)
  }

  addCourse(course) {
    this.courses[course.name] = course;
  }

  render() {
    // this should produce the readme file that represents the topic
  }
}