let ContentReader = require('./contentReader');
let yaml = require("js-yaml");

module.exports = class Workout extends ContentReader {
  constructor(path){
    super(path)
    this.insights = [];
    this.section = null;
    this.course = null;
    this.topic = null;
    this.parent = null;
    this.slug = null;
    this.parse(this.rawText);
  }

  parse(text) {
    yaml.safeLoadAll(text.split("---")[0], (doc)=>{
      for (var prop in doc) {
        if(prop !== 'insights') {
          this[prop] = doc[prop];
        }  
      }
    })
  }

  addInsight(insight) {
    this.insights.push(insight);
  }

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
}
