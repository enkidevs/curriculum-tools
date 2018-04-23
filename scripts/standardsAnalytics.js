#! usr/bin/env node

const Curriculum = require('../lib/curriculum')
const GitHub = require('../lib/networking/github')

const basePath = process.argv[2]

const git = new GitHub(basePath)

const curriculum = new Curriculum(git)

// from here you can script changes to the curriculum

let courses = [...Object.values(curriculum.topics.javascript.courses)] //curriculum.getAllCourses()
let insights = curriculum.getAllInsights()

let standards = []
let standardsBySlug = {}
let objectives = new Set()
let objectivesBySlug = {}

let coveredObjectives = new Set()
let uncoveredObjectives = new Set()
let mistaggedObjectives = []

courses.forEach(function (course) {
  course.standards.forEach((standard) => {
    standards.push(standard)
    standardsBySlug[standard.slug] = standard
    standard.objectives.forEach((objective, i) => {
      objectives.add(`${standard.slug}.${i}`)
      objectivesBySlug[`${standard.slug}.${i}`] = objective
    })
  })
})

insights.forEach((insight) => {
  if (insight.metadata.standards) {
    let standardsTags = Object.keys(insight.metadata.standards)
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
    uncoveredObjectives.add(objective)
  }
})

courses.forEach(course => {
  console.log(`## ${course.name}\n`)
  course.standards.forEach(standard => {
    let standardString = standard.name
    let fullyCovered = '✅'
    if (standard.objectives.length === 0) fullyCovered = '🛠'
    standard.objectives.forEach((objective, i) => { 
      let coveredObjective = '✅'
      if (uncoveredObjectives.has(`${standard.slug}.${i}`)) {
        coveredObjective = '❌'
        fullyCovered = '❌'
      }
      standardString += `\n  ${i}. ${coveredObjective}  ${objective}`
    })
    standardString = ` #### ${fullyCovered}  ${standardString} \n`
    console.log(standardString)
  })
})

// console.log("Covered Objectives")
// console.log(coveredObjectives)
// console.log("Uncovered Objectives")
// console.log(uncoveredObjectives)
// console.log(uncoveredObjectives)