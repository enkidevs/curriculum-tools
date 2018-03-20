#! usr/bin/env node

const Curriculum = require('../lib/curriculum')
const GitHub = require('../lib/networking/github')

const basePath = process.argv[2]

const git = new GitHub(basePath)

const curriculum = new Curriculum(git)

// from here you can script changes to the curriculum

let courses = curriculum.getAllCourses()
let insights = curriculum.getAllInsights()

let standards = []
let standardsBySlug = {}
let objectives = new Set()
let objectivesBySlug = {}

let coveredObjectives = new Set()
let uncoveredObjectives = []
let mistaggedObjectives = []

courses.forEach(function (course) {
  course.standards.forEach((standard) => {
    standards.push(standard)
    standardsBySlug[standard.slug] = standard
    standard.objectives.forEach((objective, i) => {
      objectives.add(objective)
      objectivesBySlug[`${standard.slug}.${i}`] = objective
    })
  })
})

insights.forEach((insight) => {
  if (insight.standards) {
    let standardsTags = Object.keys(insight.standards)
    standardsTags.forEach((tag) => {
      if (objectivesBySlug[tag]) {
        coveredObjectives.add(tag)
      } else {
        mistaggedObjectives.push({
          tag,
          insight
        })
      }
    })
  }
})

objectives.forEach((objective) => {
  if (!coveredObjectives.has(objective)) {
    uncoveredObjectives.push(objective)
  }
})

console.log('Covered Objectives')
console.log(coveredObjectives)
console.log('Uncovered Objectives')
console.log(uncoveredObjectives)
