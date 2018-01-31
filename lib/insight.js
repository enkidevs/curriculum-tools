let Content = require('./content');
let yaml = require('js-yaml');
// for reading Insights from a file, and also for writing to files.
// Not meant to be the main parser, just meant to provide an abstraction for dealing with lots of curriculum.


/**
 * Given an insight string and its path, creates Insight object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Insight extends Content {
  constructor({ body, path }) {
    // Should take an object
    // Content reader and writer should combine into ReaderWriter and live in curriculum
    // Each one of the contentType files (Course/Insight ...) should take in the text and path
    /**
    new Content({body: text, path: path})
    **/
    super({ body, path });
    // Obligatory Getting-rid-of-Windows-line-ending.
    this.rawText = this.rawText.replace(/\r\n/g, '\n').replace(/\n *\* */g, '\n* ');
    // Sometimes, answer lists are malformed. Ensure that list is propely formatted.
    try {
      this.parse(this.rawText);
    } catch (err) {
      console.error(`Problem with ${this.contentPath}`)
    }
  }

  parse(text) {
    this.title = text.substring(2, text.indexOf('\n'));

    this.content = (function() {
      let targetStr = '## Content';
      let startIndex = text.indexOf(targetStr) + targetStr.length + 1;
      let endIndex = text.indexOf('---', startIndex);

      return text.substring(startIndex, endIndex).trim();
    })();

    this.practiceQuestion = (function() {
      let practiceQuestion = {
        text: null,
        answers: []
      };
      let targetStr = '## Practice';
      let startIndex = text.indexOf(targetStr) + targetStr.length + 1;

      // Insight does not have Pracitce Question! Exit, leaving empty object
      if (startIndex === targetStr.length) {
        return practiceQuestion;
      }
      let endIndex = text.indexOf('---', startIndex) === -1 ? text.length : text.indexOf('---', startIndex);
      let tempcontent = text.substring(startIndex, endIndex).trim();

      practiceQuestion.text = tempcontent.substring(0, tempcontent.indexOf('\n* ')).trim();
      // Get array of every bullet, then throw out the text before.
      let answerArr = tempcontent.split('\n* ');

      answerArr.shift();
      answerArr.filter(e => Boolean(e)); // sometimes there are empty answers
      practiceQuestion.answers = answerArr;
      return practiceQuestion;
    })();

    this.revisionQuestion = (function(){
      let revisionQuestion = {
        text: null,
        answers: []
      };
      let targetStr = "## Revision";
      let startIndex = text.indexOf(targetStr) + targetStr.length + 1;
      // Insight does not have Review Question!
      if (startIndex === targetStr.length) return revisionQuestion;
      let endIndex = text.indexOf("---", startIndex) == -1 ? text.length : text.indexOf("---", startIndex);
      let tempcontent = text.substring(startIndex, endIndex).trim();
      revisionQuestion.text = tempcontent.substring(0,tempcontent.indexOf("\n* ")).trim();
      //Get array of every bullet, then throw out the text before.
      let answerArr = tempcontent.split("\n* ");
      answerArr.shift();
      answerArr.filter(e => Boolean(e)); //sometimes there are empty answers
      revisionQuestion.answers = answerArr;
      return revisionQuestion;
    })();

    this.quizQuestion = (function(){
      let targetStr = "## Quiz";
      let startIndex = text.indexOf(targetStr) + targetStr.length + 1;
      // Insight does not have Quiz Question!
      if (startIndex === targetStr.length) return null;
      let endIndex = text.indexOf("---", startIndex) == -1 ? text.length : text.indexOf("---", startIndex);
      let tempcontent = text.substring(startIndex, endIndex).trim();
      try {
        const quizQuestion = yaml.safeLoad(tempcontent);
        return quizQuestion;
      } catch(e) {
        console.log(e);
      }

      // quizQuestion.text = tempcontent.substring(0,tempcontent.indexOf("\n* ")).trim();
      // //Get array of every bullet, then throw out the text before.
      // let answerArr = tempcontent.split("\n* ");
      // answerArr.filter(e => Boolean(e)); //sometimes there are empty answers
      // quizQuestion.answers = answerArr;
      // return quizQuestion;
    })();

    if (this.tags != null && typeof(this.tags) == 'string') {
      this.tags = new Array(this.tags);
    }
    if (this.standards != null && typeof(this.standards) == 'string') {
      this.standards = new Array(this.standards);
    }

    try {
      yaml.safeLoadAll(text.split("---")[0], (doc)=>{
        for (var prop in doc) {
          this[prop] = doc[prop];
        }
      })

    } catch (e) {
      console.error(e, this.contentPath);
    }

  }

/**
 * Generates markdown based on current object properties
 * @returns {string} Markdown
 */
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

    // Type with fallback
    markdown+= `type: ${this.type || 'normal'}\n\n`;
    // Category with fallback
    markdown+= `category: ${this.category || 'must-know'}\n\n`;
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
    if (this.practiceQuestion.text != null){
      markdown+= `---\n## Practice\n\n${this.practiceQuestion.text}\n\n`;
      for (let i in this.practiceQuestion.answers) {
        markdown+= `* ${this.practiceQuestion.answers[i]}\n`;
      }
      markdown+= `\n`;
    }

    // Review Question
    if (this.revisionQuestion.text != null){
      markdown+= `---\n## Revision\n\n${this.revisionQuestion.text}\n\n`;
      for (let i in this.revisionQuestion.answers) {
        markdown+= `* ${this.revisionQuestion.answers[i]}\n`;
      }
      markdown+= `\n`;
    }

    if (this.quizQuestion != null) {
      markdown += `---\n## Quiz\n\nheadline: ${this.quizQuestion.headline}\n
question: ${this.quizQuestion.question}\n\nanswers:\n`;
      for (let i in this.quizQuestion.answers) {
        markdown += `  - ${this.quizQuestion.answers[i]}\n`;
      }
      markdown += `\n`;
    }

    // this should produce the text of the insight file
    return markdown;
  }
}