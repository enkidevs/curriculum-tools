#! usr/bin/env node

const Curriculum = require('../lib/curriculum')
const GitHub = require('../lib/networking/github')
const db = require('../lib/networking/database')
const Standard = require('../lib/models/Standard')
const Topic = require('../lib/models/Topic')
const SubTopic = require('../lib/models/SubTopic')
// const Workout = require('../lib/models/Workout')
// const Insight = require('../lib/models/Insight')

const basePath = process.argv[2]

const git = new GitHub(basePath)

const curriculum = new Curriculum(git)
curriculum.read()

// from here you can script changes to the curriculum

let standardsJSON = []
let standardsBySlug = {}
async function getModelBySlug (Model, query) {
  let modelBySlug = {}
  let models = await Model.find(query, {_id: 1, slug: 1}).lean().exec()
  models.map((topic) => {
    modelBySlug[topic.slug] = topic._id
  })
  return modelBySlug
}
async function associate () {
  let topicsBySlug = await getModelBySlug(Topic, { published: true })
  let subtopicsBySlug = await getModelBySlug(SubTopic)
  Object.values(curriculum.topics).forEach(async function (topic) {
    Object.values(topic.courses).forEach(async function (course) {
      course.standards.forEach(async function (standard) {
        standardsBySlug[standard.slug] = standard
        let input = standard.toJSON()
        input.topic = topicsBySlug[topic.slug]
        input.subtopic = subtopicsBySlug[course.slug]
        standardsJSON.push(input)
        console.log(input)
      })
    })
  })
  await create()
}
async function create () {
  standardsJSON.forEach(async function (standard) {
    console.log(standard)
    await Standard.create(standard)
  })
}

associate()
