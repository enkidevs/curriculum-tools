const fs = require('fs');
const pathNode = require('path');

module.exports = class ContentReader {
  constructor(path) {
    this.setContentPath(path);
    const text = fs.readFileSync(path, {encoding: 'utf8'});
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
    // make contentPath point to directory instead of README file
    if(contentPath.endsWith('README.md')) {
      this.contentPath = contentPath.replace(`${pathNode.sep}README.md`,'');
    } else {
      this.contentPath = contentPath;
    }
  }

  // parse(text) {
  //   console.log("Parse unimplemented")
  // }


}
