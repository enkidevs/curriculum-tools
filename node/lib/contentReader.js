

export default class ContentReader {
  constructor(text) {
    this.rawText = text;
    this.parse(text);
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


}
