const fs = require("fs")

module.exports = class ContentReader {
  constructor(path) {
    var text = fs.readFileSync(path).toString();
    if (text.length === 0) throw new Error(`File ${path} empty`);
    this.rawText = text;
  }

  setTitle(title) {
    this.title = title;
  }

  setTopic(topic) {
    this.topic = topic;
  }

  setContentPath(contentPath) {
    this.contentPath = contentPath;
  }

  // parse(text) {
  //   console.log("Parse unimplemented")
  // }


}
