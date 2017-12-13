const fs = require("fs")

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
    this.contentPath = contentPath;
    this.slug = contentPath.split("/").pop().replace(".md", ""); //last folder or filename is slug
  }

  // parse(text) {
  //   console.log("Parse unimplemented")
  // }


}
