const fs = require('fs');

/**
 * Methods for reading and writing files
 * @class
 */
module.exports = class ContentReaderWriter {
/**
 * This method reads the content of a file
 */
  readFile(path) {
    try {
      const content = fs.readFileSync(path, { encoding: 'utf8' });

      if (content.length === 0 ) throw new Error(`File ${path} is empty.`);
      return content;
    } catch (e) {
      console.log(e);
    }
  }


  /**
   * This method writes writes a new file
   */
  writeFile(path, content) {
    if (content.length === 0) throw new Error(`New file ${path} would be empty.`);
    try {
      fs.writeFileSync(path, content);
      // console.log(`Wrote ${path}`);
    } catch (e) {
      console.log(e);
    }
  }

  createDir(path) {
    try {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
    } catch (e) {
      console.log(e);
    }
  }
};
