#!usr/bin/env node

// Looks for insights of the old format
// Parses them as an insight
// And then writes them in place as the new format
// -Miles

const os = require('os')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const { Insight } = require('../lib')

// const Curriculum = require('../lib/curriculum')
// const GitHub = require('../lib/networking/github')

const topic = 'linux'

const basePath = path.join(os.homedir(), `src/curriculum/${topic}`)

process.chdir(basePath)

const filePathList = execSync(`find -name '*md'`)
  .toString()
  .split('\n')
  .filter(x => x.endsWith('.md') && !x.toLowerCase().endsWith('readme.md'))
  .map(x => path.join(basePath, x))

// console.log(filePathList)

for (let filePath of filePathList) {
  const body = fs.readFileSync(filePath, 'utf8')
  if (body.startsWith('#') && body.indexOf('type: normal') > 0) {
    const data = new Insight({ body, path: filePath }).render().toString()
    fs.writeFileSync(filePath, data)
  }
}
