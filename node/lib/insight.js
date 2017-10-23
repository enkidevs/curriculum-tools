let ContentReader = require('./contentReader')
let yaml = require("js-yaml");
// for reading Insights from a file, and also for writing to files.
// Not meant to be the main parser, just meant to provide an abstraction for dealing with lots of curriculum.

module.exports = class Insight extends ContentReader {
  constructor(text) {
    // Obligatory Getting-rid-of-Windows-line-ending.
    text = text.replace(/\r\n/g, "\n")
    // Sometimes, answer lists are malformed. Ensure that list is propely formatted.
    .replace(/\n *\*\ */g, "\n* ");

    super(text);
    this.parse(text);
  }

  parse(text) {
    this.title = text.substring(2, text.indexOf("\n"));
    this.content = (function(){
      let targetStr = "## Content";
      let startIndex = text.indexOf(targetStr) + targetStr.length + 1;
      let endIndex = text.indexOf("---", startIndex);
      return text.substring(startIndex, endIndex).trim();
    })();

    this.practiceQuestion = (function(){
      let practiceQuestion = {
        text: null,
        answers: []
      };
      let targetStr = "## Practice";
      let startIndex = text.indexOf(targetStr) + targetStr.length+1;
      let endIndex = text.indexOf("---", startIndex) == -1 ? text.length : text.indexOf("---", startIndex);
      // Insight does not have Pracitce Question! Exit, leaving empty object
      if (startIndex === -1) return practiceQuestion;
      let tempcontent = text.substring(startIndex, endIndex).trim();
      practiceQuestion.text = tempcontent.substring(0,tempcontent.indexOf("\n* ")).trim();
      //Get array of every bullet, then throw out the text before.
      let answerArr = tempcontent.split("\n* ");
      answerArr.shift();
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
      let endIndex = text.indexOf("---", startIndex) == -1 ? text.length : text.indexOf("---", startIndex);
      // Insight does not have Review Question!
      if (startIndex === -1) return revisionQuestion;
      let tempcontent = text.substring(startIndex, endIndex).trim();
      revisionQuestion.text = tempcontent.substring(0,tempcontent.indexOf("\n* ")).trim();
      //Get array of every bullet, then throw out the text before.
      let answerArr = tempcontent.split("\n* ");
      answerArr.filter(e => Boolean(e)); //sometimes there are empty answers
      revisionQuestion.answers = answerArr;
      return revisionQuestion;
    })();

    this.quizQuestion = (function(){
      let quizQuestion = {
        text: null,
        answers: []
      };
      let targetStr = "## Quiz";
      let startIndex = text.indexOf(targetStr) + targetStr.length + 1;
      let endIndex = text.indexOf("---", startIndex) == -1 ? text.length : text.indexOf("---", startIndex);
      // Insight does not have Quiz Question!
      if (startIndex === -1) return revisionQuestion;
      let tempcontent = text.substring(startIndex, endIndex).trim();
      quizQuestion.text = tempcontent.substring(0,tempcontent.indexOf("\n* ")).trim();
      //Get array of every bullet, then throw out the text before.
      let answerArr = tempcontent.split("\n* ");
      answerArr.filter(e => Boolean(e)); //sometimes there are empty answers
      quizQuestion.answers = answerArr;
      return quizQuestion;
    })();

    yaml.safeLoadAll(text.split("---")[0], (doc)=>{
      for (var prop in doc) {
        this[prop] = doc[prop];
      }
    })
  }

    render() {
      // this should produce the text of the insight file
    }
}
