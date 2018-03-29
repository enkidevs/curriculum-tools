#! usr/bin/env node

const Curriculum = require('../lib/curriculum')
const GitHub = require('../lib/networking/github')

const basePath = process.argv[2]
const git = new GitHub(basePath)

const curriculum = new Curriculum(git)

for (let topicSlug in curriculum.topics) {
  console.log(`## ${topicSlug}`)
  for (let courseSlug in curriculum.topics[topicSlug].courses) {
    console.log(`### ${courseSlug}`)
    let course = curriculum.topics[topicSlug].courses[courseSlug]
    console.log(course.render())
  }
}
