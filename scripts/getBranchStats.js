#!/usr/bin/env node

const Curriculum = require('../lib/curriculum')
const GitHub = require('../lib/networking/github')

const basePath = process.argv[2]

const git = new GitHub(basePath)

const curriculum = new Curriculum(git)

for (let t in curriculum.topics) {
  let topic = curriculum.topics[t]
  if (topic.courses) {
    for (let c in topic.courses) {
      let course = topic.courses[c]
      course.writeFile()
    }
  }
}

for (let topicName in curriculum.topics) {
  let topic = curriculum.topics[topicName]
  console.log('Topic: ' + topicName)
  for (let courseName in topic.courses) {
    console.log('Course: ' + courseName)
  }
}
