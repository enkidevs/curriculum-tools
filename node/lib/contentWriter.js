const fs = require("fs")
const ContentReader = require('./contentReader')

module.exports = class ContentWriter extends ContentReader {
  constructor(path) {
    super(path)
  }


  writeFile() {
    fs.writeFile(this.contentPath, this.render(), (err) => {
      if (!err) console.info(`Wrote ${this.contentPath}`)
    })
  }



}
