import ContentReader from `ContentReader`;
import yaml from `js-yaml`;

export default class Course extends ContentReader {
  constructor (text) {

    this.topic = null;
    this.workouts = [];
    this.standards = [];
    this.sections = {};
    this.parse(text);
  }

  parse(text) {

  }

}
