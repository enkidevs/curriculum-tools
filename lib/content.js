const nodePath = require('path');

module.exports = class Content {
  constructor({body, path}) {
    this.rawText = body;
    this.contentPath = path;
    setSlug();
  }

  setSlug() {
    let end = this.contentPath.split(nodePath.sep).pop().replace('.md', ''); // this is either a slug or folder name
    this.slug = (end === 'README') ? this.contentPath.split(nodePath.sep).splice(-2, 1)[0] : end; // get folder name
  }
}
