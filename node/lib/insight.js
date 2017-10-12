
let ContentReader = require('./contentReader')

// for reading Insights from a file, and also for writing to files.
// Not meant to be the main parser, just meant to provide an abstraction for dealing with lots of curriculum.

module.exports = class Insight extends ContentReader {
    constructor(text) {
      super(text);
      this.parse(text);
    }

    parse(text) {

      console.log("insight parse unimplemented")
      // get yaml, append to properties
      // get questions
      // analyse questions
    }

    render() {
      // this should produce the text of the insight file
    }
}
