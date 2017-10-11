// for reading Insights from a file, and also for writing to files.
// Not meant to be the main parser, just meant to provide an abstraction for dealing with lots of curriculum.

export default class Insight extends ContentReader() {
    constructor(text) {
      super(text);
    }

    parse(text) {
      // get yaml, append to properties
      // get questions
      // analyse questions
    }
}
