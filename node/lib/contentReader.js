

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
    this.slug = contentPath.split("/").pop().replace(".md", ""); //last folder or filename is slug
  }

  parse(text) {
    console.log("Parse unimplemented")
  }


}
