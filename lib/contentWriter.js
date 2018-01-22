const fs = require('fs')
const ContentReader = require('./contentReader')

/**
 * Methods for exporting ContentReader data to file
 * @class
 * @extends ContentReader
 * @param {string} filepath
 */
module.exports = class ContentWriter extends ContentReader {
  constructor(path) {
    super(path)
  }

/**
 * This method writes the target's rendered content at its contentPath
 */
  writeFile() {
    fs.writeFile(this.contentPath, this.render(), (err) => {
      if (!err) console.info(`Wrote ${this.contentPath}`)
    })
  }

}
