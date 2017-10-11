

module.exports = class ContentReader {
  constructor(text) {
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

  parse(text) {
    console.log("Parse unimplemented")
  }


}
