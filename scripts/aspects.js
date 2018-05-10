'use strict'
// utility for reading in the entire curriculum from a file path
const fs = require('fs')
const Insight = require('../lib/insight')
const vfile = require('to-vfile')

// My local path
// Used find command from unix to get slugs for all insights
// Load them into the pathList array
// Also perform filtering to exclude README.ME files and LICENSE.md
// However I don't know how to exclude exercises as well
const localPath = '../../curriculum2/pathFile.txt'
const aspects = ['new', 'workout', 'deep', 'introduction', 'obscura']
let path = []
let pathsList = []
path = fs.readFileSync(localPath).toString('utf-8')
pathsList = path.split('\n')
pathsList
  .filter(path => {
    return (!path.includes('README.md') && !path.includes('LICENSE.md') && !path.includes('practice'))
  }).forEach(insightPath => {
    if (fs.existsSync(insightPath)) {
      const insightFile = vfile.readSync(insightPath, 'utf-8')
      const insight = new Insight({ body: insightFile.contents, path: insightPath })
      if (insight.tags) {
        console.log(insight.tags)
      }
    }
  })
