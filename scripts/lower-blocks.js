#!/usr/bin/env node
// A script to go through all insights,
// look for codeblocks that have syntax highlighting
// and create a list of languages as `output`
// - Miles

const os = require('os')
const path = require('path')

const Curriculum = require('../lib/curriculum')
const GitHub = require('../lib/networking/github')

const basePath = path.join(os.homedir(), '/src/')

const git = new GitHub(basePath)
const curriculum = new Curriculum(git)

let output = {}

for (let topic of Object.values(curriculum.topics)) {
  for (let course of Object.values(topic.courses)) {
    for (let workout of course.workouts) {
      for (let insight of workout.insights) {
        if (insight.rawText && insight.rawText.indexOf('type: normal') > 0) {
          const regex = /``` *(.*?) *\n/
          const str = regex.exec(insight.rawText)
          if (str && str[1] !== '') {
            (output[str[1]]) ? output[str[1]] += 1 : output[str[1]] = 1
          }
        }
      }
    }
  }
}

console.log(output)
