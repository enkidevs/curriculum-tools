

export default class Topic {
  constructor (text) {
    super(text)
    this.courses = {};
    this.topicNamespace = null;
  }

  parse(text) {

  }

  setNamespace(namespace) {
    this.topicNamespace = namespace;
  }
}
