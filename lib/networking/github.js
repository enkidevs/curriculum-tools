const os = require('os')
const fs = require('fs')
const nodePath = require('path')
const chalk = require('chalk')
const { execSync, spawnSync } = require('child_process')
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
    return nodePath.join(this.basePath, 'curriculum')
  }

  /**
   * Get path of local standards repo
   * @returns {string} literal filepath
   */
  getStandardsPath () {
    return nodePath.join(this.basePath, 'standards')
  }

  /**
   * Get path of local curriculum.wiki repo
   * @returns {string} literal filepath
   */
  getWikiPath () {
    return nodePath.join(this.basePath, 'curriculum.wiki')
  }

  /**
   * Clone the HTTPS version of the 3 relevant repos: curriculum, standards and wiki.
   * @returns {string} literal filepath
   */
  cloneRepos () {
    console.log(chalk.black.bgBlueBright(' Cloning operation started. '))

    if (!fs.existsSync(this.basePath)) {
      // create src file
      fs.mkdirSync(this.basePath)
      console.log(
        chalk.magenta.bold(
          `Directory created at given path "${this.basePath}".`
        )
      )
    }

    this.cloneRepository({
      name: 'curriculum',
      path: this.basePath,
      url: CURRICULUM_BASE_URL
    })

    this.cloneRepository({
      name: 'standards',
      path: this.basePath,
      url: STANDARDS_BASE_URL
    })

    this.cloneRepository({
      name: 'curriculum.wiki',
      path: this.basePath,
      url: CURRICULUM_BASE_URL + '.wiki'
    })

    console.log(chalk.black.bgBlueBright(' Cloning operation finished. '))
  }

  /**
   * Get working branch of local repository
   * @param {string} repo name
   */
  getGitBranch (repoName = 'curriculum') {
    return execSync(`git rev-parse --abbrev-ref HEAD`, {
      cwd: nodePath.join(this.basePath, repoName),
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

  cloneRepository ({ name, url, path }) {
    const destinationPath = nodePath.join(path, name)
    if (!fs.existsSync(destinationPath)) {
      console.log(
        chalk.magenta.bold(
          `Repository "${name}" not found at path "${path}". Starting to clone...`
        )
      )
      spawnSync('git', ['clone', url], {
        cwd: path,
        stdio: 'inherit'
      })
      console.log(chalk.green.bold(`Finished cloning "${name}" repository.`))
    } else {
      console.log(
        chalk.green.bold(
          `Repository "${name}" found at path "${path}". Skipping cloning.`
        )
      )
    }
  }
}
