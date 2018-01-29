const fs = require('fs');

/**
 * Methods for reading and writing files
 * @class
 */
module.exports = class ContentReaderWriter {
  constructor() {
    /**
     * This method reads the content of a file
     */
    this.readFile = (path) => {
      try {
        const content = fs.readFileSync(path, {encoding: 'utf8'});
        if(content.length === 0 ) throw new Error(`File ${path} is empty.`);
        return content;
      } catch(e) {
        console.log(e);
        throw e;
      }
    }

    /**
     * This method writes writes a new file
     */
    this.writeFile = (content, path) => {
      try {
        if(content.length === 0) throw new Error(`New file ${path} would be empty.`);
        fs.writeFile(path, string, () => console.log(`Wrote ${path}`));
      } catch(e) {
        console.log(e);
        throw e;
      }
    }
  }
}
