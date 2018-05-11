'use strict'
// utility for reading in the entire curriculum from a file path
const fs = require('fs')
const Insight = require('../lib/insight')
const childProcess = require('child_process').execSync

let curriculumPath
let topic
let curriculum

const aspects = ['new', 'workout', 'deep', 'introduction', 'obscura']

function loadCurriculumFromLocalPath () {
  process.argv.forEach((val, index) => {
    if (index === 2) {
      console.log(`${index}: ${val}`)
      curriculumPath = val
    } else if (index === 3) {
      console.log(`${index}:${val}`)
      topic = val
    }
  })
  curriculum = childProcess(`find ${curriculumPath}/${topic} -name "*.md"`).toString('utf-8')
  curriculum = curriculum.split('\n')
  console.log(typeof (curriculum))
  return curriculum
}

function migrateAspectsFromTags () {
  loadCurriculumFromLocalPath()
    .forEach(insightPath => {
      if (!insightPath.includes('README.md') && !insightPath.includes('LICENSE.md') && fs.existsSync(insightPath)) {
        const insightFile = fs.readFileSync(insightPath, 'utf-8')
        const insight = new Insight({ body: insightFile, path: insightPath })
        if (insight.metadata.tags !== undefined) {
          const insightAspects = insight.metadata.tags.filter(tag =>
            aspects.includes(tag))
          if (insightAspects.length > 0 && !insightAspects.includes('Deprecation') && !insightAspects.includes('Bullet')) {
            insight.metadata.aspects = insightAspects
            // console.log(`THESE ARE ASPECTS: ${insight.metadata.aspects}`)
            insight.metadata.tags = insight.metadata.tags.filter(
              tag => !aspects.includes(tag)
            )
            // I used console.log() on the modified insight and it works as expected
            // However, the .render() method returns undefined

            const newInsightFile = insight.render()
            // console.log(typeof (newInsightFile))
            // fs.writeFileSync(insightPath, newInsightFile)
          }
        }
      }
    })
}

migrateAspectsFromTags()
