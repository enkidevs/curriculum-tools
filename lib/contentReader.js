const fs = require("fs")


/**
 * Reads a file path and generate a ContentReader class
 * @name ContentReader
 * @class
 * @param {string} filepath
 * @returns {ContentReader}
 */
module.exports = class ContentReader {
  constructor(path) {
    this.setContentPath(path);
    const text = fs.readFileSync(path, {encoding: 'utf8'});
    if (text.length === 0) throw new Error(`File ${path} empty`);
    this.rawText = text;
  }

/**
 * Sets title of content to string
 * @param {string} new title
 */
  setTitle(title) {
    this.title = title;
  }
/**
 * Sets topic of content to string
 * @param {string} new topic
 */
  setTopic(topic) {
    this.topic = topic;
  }

/**
 * Sets path of content to string
 * @param {string} new content path
 */
  setContentPath(contentPath) {
    this.contentPath = contentPath;
    let end = contentPath.split("/").pop().replace(".md", ""); //last folder or filename is slug
    this.slug = (end == "README") ? contentPath.split("/").splice(-2, 1)[0] : end;
  }

  // parse(text) {
  //   console.log("Parse unimplemented")
  // }


}
