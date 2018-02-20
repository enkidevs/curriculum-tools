const path = require('path');
const { statSync, readdirSync} = require('fs');

/**
 * Returns start of non-whitespace in string
 * @param {string}
 * @returns {number} Index of first non-whitespace character
 */
exports.getIndentation = (string) => {
  return string.search(/\S/);
}
/**
 *
 *
*/
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

exports.toTitleCase = (string) => {
    return string.replace(/\-/g, " ").replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
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
};

exports.removeEmptyObjectProperties = (obj) => {
  const filteredEntries = Object.entries(obj).filter(([ , value ]) => {
    if (value === null || typeof value === 'undefined') {
      return false;
    }
    if (Array.isArray(value) || typeof value === 'string') {
      return value.length > 0;
    } else if (typeof value === 'object' && !(value instanceof Date)) {
      return Object.keys(value).length > 0;
    }
    return true;
  });

  return filteredEntries.reduce((acc, [ key, value ]) => {
    acc[key] = value;
    return acc;
  }, {});
};

function encodePath(_path = '') {
  return _path.replace(/#/g, 'sharp');
}

exports.encodePath = encodePath;

function decodePath(_path = '') {
  return _path.replace(/sharp/g, '#');
}

exports.decodePath = decodePath;

function extractNames(filename = '', team) {
  let sections = filename.split('/');
  const slug = sections.pop().split('.md')[0];

  const archived = sections[0] === '.archived';

  if (archived) {
    sections.shift(); // remove .archived from the array
  }

  const topicSlug = (team && sections[0] ? (team._id.toString() + '-') : '') + decodePath(sections.shift())
  const courseSlug = decodePath(sections.shift());
  const workoutSlug = decodePath(sections.shift());

  return {
    archived,
    courseSlug,
    topicSlug,
    workoutSlug,
    slug
  };
}

exports.extractNames = extractNames;


function getDomainFromURL (url) {
  if (url) {
    let domain;
    
    // find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf('://') > -1) {
      domain = url.split('/')[2];
    } else {
      domain = url.split('/')[0];
    }

    // find & remove port number
    domain = domain.split(':')[0];

    return domain;
  }
  return null;
}

const mdUrlRegEx = /\[(.*)\]\((.*)\)/;
const mdUrlRegExWithType = /\[(.*)\]\((.*)\)\{(.*)\}/;

function getMarkdownLink (link) {
  let result;

  if (mdUrlRegExWithType.test(link)) {
    result = mdUrlRegExWithType.exec(link);
    return { name: result[1], url: result[2], nature: result[3] };
  }
  if (mdUrlRegEx.test(link)) {
    result = mdUrlRegEx.exec(link);
    return { name: result[1], url: result[2], nature: 'website' };
  }
  return {
    nature: 'website',
    name: getDomainFromURL(link),
    url: link
  };
}

exports.getMarkdownLink = getMarkdownLink;
