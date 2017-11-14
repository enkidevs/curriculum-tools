const { REPO_BASE_URL } = require('../constants');

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

exports.getGitBranch = (path, execSync) => {
  return execSync(`git rev-parse --abbrev-ref HEAD`, {cwd: path, encoding: 'utf8'});
}

exports.getGitHubLink = (branch, insightPath) => {
  return `${REPO_BASE_URL}/blob/${branch}/${encodeURIComponent(insightPath)}`;
}
