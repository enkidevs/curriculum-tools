const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { CURRICULUM_BASE_URL, STANDARDS_BASE_URL } = require('../../constants');

module.exports = class GitHub {
  constructor(basePath) {
    if(!basePath) {
      console.log('No directory specified, defaulting to home/user/src.');
      basePath = `${os.homedir()}/src`;
    }
    this.basePath = basePath;
  }

  setBasePath(basePath) {
    this.basePath = basePath;
  }

  getCurriculumPath() {
    return path.join(this.basePath, 'curriculum');
  }

  getStandardsPath() {
    return path.join(this.basePath, 'standards');
  }

  getWikiPath() {
    return path.join(this.basePath, 'curriculum.wiki');
  }

  cloneRepos() {
    console.log('This will clone the HTTPS version of the 3 relevant repos: curriculum, standards and wiki.');
    const curriculumPath = path.join(this.basePath, 'curriculum');
    const standardsPath = path.join(this.basePath, 'standards');
    const wikiPath = path.join(this.basePath, 'curriculum.wiki');

    if(!fs.existsSync(curriculumPath)) {
      // curriculum
      execSync(`git clone ${CURRICULUM_BASE_URL}`, {cwd: this.basePath});
    }

    if(!fs.existsSync(standardsPath)) {
      // standards
      execSync(`git clone ${STANDARDS_BASE_URL}`, {cwd: this.basePath});
    }

    if(!fs.existsSync(wikiPath)) {
      // curriculum wiki
      execSync(`git clone ${CURRICULUM_BASE_URL}.wiki`, {cwd: this.basePath});
    }
  }

  getGitBranch(repoName = 'curriculum') {
    return execSync(`git rev-parse --abbrev-ref HEAD`, {cwd: path.join(this.basePath, repoName), encoding: 'utf8'}).trim();
  }

  getInsightURL(branch, insightPath) {
    return `${CURRICULUM_BASE_URL}/blob/${branch}/${encodeURI(insightPath)}`;
  }
}
