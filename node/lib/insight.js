let ContentReader = require('./contentReader')
let yaml = require("js-yaml");
// for reading Insights from a file, and also for writing to files.
// Not meant to be the main parser, just meant to provide an abstraction for dealing with lots of curriculum.

module.exports = class Insight extends ContentReader {
  constructor(path) {
    super(path);
    // Obligatory Getting-rid-of-Windows-line-ending.
    this.rawText = this.rawText.replace(/\r\n/g, "\n")
    // Sometimes, answer lists are malformed. Ensure that list is propely formatted.
    .replace(/\n *\*\ */g, "\n* ");
    
    this.parse(this.rawText);
  }

  parse(text) {
    this.title = text.substring(2, text.indexOf("\n"));
    yaml.safeLoadAll(text.split("---")[0], (doc)=>{
      for (var prop in doc) {
        this[prop] = doc[prop];
      }
    })
    this.content = (function(){
      let targetStr = "## Content";
      let startIndex = text.indexOf(targetStr);
      let tempcontent = text.substring(startIndex+targetStr.length+1, text.indexOf("---", startIndex)).trim();
      return tempcontent;
    })();

    this.practiceQuestion = (function(){
      let practiceQuestion = {};
      let targetStr = "## Practice";
      let startIndex = text.indexOf(targetStr);
      // Insight does not have Pracitce Question! Exit, leaving empty object
      if (startIndex === -1) return;
      let tempcontent = text.substring(startIndex+targetStr.length+1, text.indexOf("---", startIndex)).trim();
      practiceQuestion.text = tempcontent.substring(0,tempcontent.indexOf("\n* ")).trim();
      //Get array of every bullet, then throw out the text before.
      let answerArr = tempcontent.split("\n* ");
      answerArr.shift();
      practiceQuestion.answers = answerArr;
      return practiceQuestion;
    })();

    this.revisionQuestion = (function(){
      let revisionQuestion = {};
      let targetStr = "## Revision";
      let startIndex = text.indexOf(targetStr);
      // Insight does not have Review Question! Exit, leaving empty object
      if (startIndex === -1) return {};
      let tempcontent = text.substring(startIndex+targetStr.length+1, text.length).trim();
      revisionQuestion.text = tempcontent.substring(0,tempcontent.indexOf("\n* ")).trim();
      //Get array of every bullet, then throw out the text before.
      let answerArr = tempcontent.split("\n* ");
      answerArr.shift();
      revisionQuestion.answers = answerArr;
      return revisionQuestion;
    })();

    // Hotfix. Ensure that things that should be iterated over are in an array
    if (this.tags != null && typeof(this.tags) == 'string') {
      this.tags = new Array(this.tags);
    }
    if (this.standards != null && typeof(this.standards) == 'string') {
      this.standards = new Array(this.standards);
    }
  }

  render() {
    var markdown = "";
    // Title
    markdown+= `# ${this.title}\n`;
    // Author
    if (this.author != null) markdown+= `author: ${this.author}\n\n`;
    // Levels
    if (this.levels != null){
      markdown+= `levels:\n\n`;
      for (let i in this.levels) {
        markdown+= `  - ${this.levels[i]}\n\n`;
      }
    }

    // Type
    if (this.type != null) markdown+= `type: ${this.type}\n\n`;
    // Category
    if (this.category != null) markdown+= `category: ${this.category}\n\n`;
    // Standards
    if (this.standards != null) {
      markdown+= `standards:\n\n`;
      for (let i in this.standards) {
        markdown+= `  - ${i}: ${this.standards[i]}\n\n`;
      }
    }
    // Tags
    if (this.tags != null) {
      markdown+= `tags:\n\n`;
      for (let i in this.tags) {
        markdown+= `  - ${this.tags[i]}\n\n`;
      }
    }

    // Links
    if (this.links != null && this.links.length > 0) {
      markdown+= `links:\n\n`;
      for (let i in this.links) {
        markdown+= `  - >-\n    ${this.links[i]}\n\n`;
      }
    }

    // Content
    markdown+= `---\n## Content\n\n${this.content}\n\n`;

    // Practice Question
    if (this.practiceQuestion != null){
      markdown+= `---\n## Practice\n\n${this.practiceQuestion.text}\n\n`;
      for (let i in this.practiceQuestion.answers) {
        markdown+= `* ${this.practiceQuestion.answers[i]}\n`;
      }
      markdown+= `\n`;
    }

    // Review Question
    if (this.revisionQuestion != null){
      markdown+= `---\n## Revision\n\n${this.revisionQuestion.text}\n\n`;
      for (let i in this.revisionQuestion.answers) {
        markdown+= `* ${this.revisionQuestion.answers[i]}\n`;
      }
      markdown+= `\n`;
    }

    // this should produce the text of the insight file
    return markdown;
  }
}
