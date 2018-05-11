'use strict'
// utility for reading in the entire curriculum from a file path
const fs = require('fs')
const Insight = require('../lib/insight')
const execSync = require('child_process').execSync
let curriculum
const aspects = ['new', 'workout', 'deep', 'introduction', 'obscura']

function loadCurriculumFromLocalPath () {
  const [, , curriculumPath, topicName] = process.argv
  if (!fs.existsSync(curriculumPath)) {
    throw new Error('Invalid curriculum path')
  }
  const insightAndExercisesPaths = [curriculumPath, topicName].join('/')
  if (!fs.existsSync(insightAndExercisesPaths)) {
    throw new Error('Invalid topic path')
  }
  console.log(insightAndExercisesPaths)
  curriculum = execSync(`find ${insightAndExercisesPaths} -name "*.md"`).toString('utf-8').split('\n')
    .filter(insightPath => {
      return (!insightPath.includes('README.md') &&
      !insightPath.includes('LICENSE.md') && fs.existsSync(insightPath))
    })
  return curriculum
}
function migrateAspectsFromTags () {
  loadCurriculumFromLocalPath()
    .forEach(insightPath => {
      const insightFile = fs.readFileSync(insightPath, 'utf-8')
      const insight = new Insight({ body: insightFile, path: insightPath })
      const { metadata: {tags} } = insight
      if (tags !== undefined) {
        const insightAspects = tags.filter(tag =>
          aspects.includes(tag))
        if (insightAspects.length > 0 && !insightAspects.includes('Deprecation') && !insightAspects.includes('Bullet')) {
          insight.metadata.aspects = insightAspects
          insight.metadata.tags = tags.filter(
            tag => !aspects.includes(tag)
          )
          const newInsightFile = insight.render()
          fs.writeFileSync(insightPath, newInsightFile)
        }
      }
    })
}

migrateAspectsFromTags()
