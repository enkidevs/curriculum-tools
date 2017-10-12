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
    yaml.safeLoadAll(text.split("---")[0], (doc)=>{
      for (var prop in doc) {
        this[prop] = doc[prop];
      }
    })
  }

  parse() {
    console.log("workout parse unimplemented")
    
  }

  addInsight() {
    
  }
}
