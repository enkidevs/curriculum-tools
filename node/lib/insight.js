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

    this.reviewQuestion = (function(){
      let revisionQuestion = {};
      let targetStr = "## Revision";
      let startIndex = text.indexOf(targetStr);
      // Insight does not have Review Question! Exit, leaving empty object
      if (startIndex === -1) return;
      let tempcontent = text.substring(startIndex+targetStr.length+1, text.length).trim();
      revisionQuestion.text = tempcontent.substring(0,tempcontent.indexOf("\n* ")).trim();
      //Get array of every bullet, then throw out the text before.
      let answerArr = tempcontent.split("\n* ");
      answerArr.shift();
      revisionQuestion.answers = answerArr;
      return revisionQuestion;
    })();

    yaml.safeLoadAll(text.split("---")[0], (doc)=>{
      for (var prop in doc) {
        this[prop] = doc[prop];
      }
    })
  }
}
