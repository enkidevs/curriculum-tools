const path = require('path');
const { statSync, readdirSync} = require('fs');

exports.getIndentation = (string) => {
  return string.search(/\S/);
}

exports.containsLink = (string, linkMatcher) => {
  return !(!string.match(linkMatcher));
}

exports.slugify = (string) => {
 return (
   string
     .toLowerCase()
     .replace(/\s+/g, '-')
     .replace(/[^\w\-]+/g, '')
     .replace(/\-\-+/g, '-')
     .replace(/^-+/, '')
     .replace(/-+$/, '')
 );
}

exports.capitalize = (string) => {
  return string[0].toUpperCase() + string.substring(1);
}

exports.hasDash = (string) => {
  return exports.getIndentation(string) === string.indexOf('-');
}

exports.getAllFilesRecursively = (dirPath) => {
  return statSync(dirPath).isDirectory() ?
    Array.prototype.concat(...readdirSync(dirPath)
      .filter(file => !file.match(/README\.md/) && !file.match(/\.git/))
      .map(file => exports.getAllFilesRecursively(path.join(dirPath, file)))
    )
    : dirPath;
}
