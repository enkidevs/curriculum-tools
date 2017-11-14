const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const os = require('os');
const { execSync } = require('child_process');
const { getGitBranch, getGitHubLink } = require('./helpers');

module.exports = {
  addStubsToWiki: function(curriculumPath) {
    console.log('Getting the active git branch in the curriculum repo.');
    const gitBranch = getGitBranch(curriculumPath, execSync);
    const stubPaths = getListOfStubs(curriculumPath);
    console.log('Done retrieving stubs.\n');

    const desktopPath = path.join(os.homedir(), 'Desktop');
    cloneWiki(desktopPath);
    console.log('Done cloning Wiki.\n');

    const listOfStubsPath = path.join(desktopPath, 'curriculum.wiki', 'List-of-Stubs.md');
    addListOfStubsToFile(listOfStubsPath, stubPaths);

  }
}

function getInsights(curriculumPath) {
  return fs.statSync(curriculumPath).isDirectory() ?
    Array.prototype.concat(...fs.readdirSync(curriculumPath)
      .filter(file => !file.match(/[A-Z]+\.md/) && !file.match(/\.git/))
      .map(file => getInsights(path.join(curriculumPath, file))))
     : curriculumPath;
}

function getListOfStubs(curriculumPath) {
  console.log('Getting list of stubs on the current branch.');
  return getInsights(curriculumPath).filter(insightPath => {
    const metadata = fs.readFileSync(insightPath, { encoding: 'utf8'}).split('---')[0];
    return yaml.safeLoad(metadata).stub;
  });
}

function cloneWiki(desktopPath) {
  const wikiPath = path.join(desktopPath, 'curriculum.wiki');
  if(!fs.existsSync(wikiPath)) {
    console.log('Cloning Wiki on Desktop.');
    execSync('git clone https://github.com/enkidevs/curriculum.wiki.git', { cwd: desktopPath });
  } else {
    console.log('Repository found. Fetching newest version.');
    execSync('git fetch --all', { cwd: wikiPath });
  }
}

function addListOfStubsToFile(listPath, stubPaths) {
  if(!fs.existsSync(listPath)) {

  } else {

  }
}

const curriculumPath = process.argv[2];

module.exports.addStubsToWiki(curriculumPath);
