const nodePath = require('path');

module.exports = class Content {

  constructor({ body, path }) {
    if (body.cwd && body.contents) body = body.contents // add vfile without changing interface

    this.rawText = body;
    this.contentPath = path;

    if (path) {
      this.findSlug();
    }
  }

  findSlug() {
    let end = this.contentPath.split(nodePath.sep).pop().replace('.md', ''); // this is either a slug or folder name
    this.slug = (end === 'README') ? this.contentPath.split(nodePath.sep).splice(-2, 1)[0] : end; // get folder name
  }

  setSlug(slug) {
    this.slug = slug;
  }

  setContentPath(path) {
    this.contentPath = path;
  }
};
