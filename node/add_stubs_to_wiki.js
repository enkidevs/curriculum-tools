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
    const actualStubPaths = getListOfStubs(curriculumPath);
    console.log('Done retrieving stubs.\n');

    const desktopPath = path.join(os.homedir(), 'Desktop');
    cloneWiki(desktopPath);
    console.log('Done cloning Wiki.\n');

    console.log('Generating table of stubs.');
    const table = parseListOfStubs(gitBranch, actualStubPaths);
    const pathToListOfStubs = path.join(desktopPath, 'curriculum.wiki', 'List-of-Stubs.md');

    if(!fs.existsSync(pathToListOfStubs)) {
      fs.writeFileSync(pathToListOfStubs, `This is a list of stubs:\n\n${table}`);
      console.log('Wrote to the file.');
    }

    updateWikiPage(desktopPath);
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
    // execSync('git fetch --all', { cwd: wikiPath });
  }
}

function parseListOfStubs(gitBranch, stubPaths) {
  let table = createTableBase();
  table += stubPaths.map(path => {
    const info = path.split('/curriculum/')[1].split('/');
      let topic, course, workout, stub;
      if(info.length === 3) {
        [topic, course, stub] = info;
        workout = '';
      } else if(info.length === 4) {
        [topic, course, workout, stub] = info;
      }
      return `[[${topic} Topic]] | ${course} | ${workout} | [${stub}](${getGitHubLink(gitBranch, path.split('/curriculum/')[1])})\
       | ${gitBranch} |  | `;
  }).join('\n');
  return table;
}

function createTableBase() {
  let table = '';

  // Header
  table += 'Topic | Course | Workout | Insight Slug | Branch | In Progress | Author\n';

  // Margin
  table += '---| --- | --- | --- | --- | --- | ---\n';
  return table;
}

function updateWikiPage(desktopPath) {
  const wikiPath = path.join(desktopPath, 'curriculum.wiki');
  try {
    execSync('git add . && git commit -m "Add more stubs to the wiki" && git push', { cwd: wikiPath });
  } catch(e) {
    console.log('No new stubs found, exiting.');
  }
}


const curriculumPath = process.argv[2];

module.exports.addStubsToWiki(curriculumPath);
