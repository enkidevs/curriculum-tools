//** Standards cli helper functions, for ease of creation and statistics **/
let os = require('os')
let ContentReader = require('./contentReader')

module.exports = class Standard extends ContentReader {
  constructor(text) {
    super(text)
  }

  parse() {
    console.log("standard parse unimplemented")
  }

  render() {
    // this should produce the text of the standard file
  }
}
