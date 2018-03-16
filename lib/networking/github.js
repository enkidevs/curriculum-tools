const os = require('os')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { CURRICULUM_BASE_URL, STANDARDS_BASE_URL } = require('../constants')

module.exports = class GitHub {
  constructor (basePath) {
    if (!basePath) {
      console.log('No git directory specified, defaulting to home/user/src.')
      basePath = `${os.homedir()}/src`
    }
    this.basePath = basePath
  }

  /**
   * Redefine local working directory
   * @param {string} filepath
   */
  setBasePath (basePath) {
    this.basePath = basePath
  }

  /**
   * Get path of local curriculum repo
   * @returns {string} literal filepath
   */
  getCurriculumPath () {
    return path.join(this.basePath, 'curriculum')
  }

  /**
   * Get path of local standards repo
   * @returns {string} literal filepath
   */
  getStandardsPath () {
    return path.join(this.basePath, 'standards')
  }

  /**
   * Get path of local curriculum.wiki repo
   * @returns {string} literal filepath
   */
  getWikiPath () {
    return path.join(this.basePath, 'curriculum.wiki')
  }

  /**
   * Clone the HTTPS version of the 3 relevant repos: curriculum, standards and wiki.
   * @returns {string} literal filepath
   */
  cloneRepos () {
    const curriculumPath = path.join(this.basePath, 'curriculum')
    const standardsPath = path.join(this.basePath, 'standards')
    const wikiPath = path.join(this.basePath, 'curriculum.wiki')

    if (!fs.existsSync(this.basePath)) {
      // create src file
      fs.mkdirSync(this.basePath)
    }

    if (!fs.existsSync(curriculumPath)) {
      // curriculum
      execSync(`git clone ${CURRICULUM_BASE_URL}`, { cwd: this.basePath })
    }

    if (!fs.existsSync(standardsPath)) {
      // standards
      execSync(`git clone ${STANDARDS_BASE_URL}`, { cwd: this.basePath })
    }

    if (!fs.existsSync(wikiPath)) {
      // curriculum wiki
      execSync(`git clone ${CURRICULUM_BASE_URL}.wiki`, { cwd: this.basePath })
    }
  }

  /**
   * Get working branch of local repository
   * @param {string} repo name
   */
  getGitBranch (repoName = 'curriculum') {
    return execSync(`git rev-parse --abbrev-ref HEAD`, {
      cwd: path.join(this.basePath, repoName),
      encoding: 'utf8'
    }).trim()
  }

  /**
   * Get GitHub URL of Insight
   * @param {string} branch
   * @param {string} filepath to insight
   */
  getInsightURL (branch, insightPath) {
    return `${CURRICULUM_BASE_URL}/blob/${branch}/${encodeURI(insightPath)}`
  }
}
