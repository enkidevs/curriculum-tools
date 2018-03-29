#! usr/bin/env node
const db = require('monk')(
  process.env.MONGO_URL || 'mongodb://localhost:27017/insights'
)

const Curriculum = require('../lib/curriculum')
const GitHub = require('../lib/networking/github')

const basePath = process.argv[2]

async function run () {
  const Topic = db.get('topics')
  const Course = db.get('subtopics')
  const Standard = db.get('standards')

  const git = new GitHub(basePath)
  const curriculum = new Curriculum(git)
  curriculum.read()

  const curriculumCourses = Object.values(curriculum.topics).reduce(
    (courses, topic) => {
      return courses.concat(
        Object.values(topic.courses).map(course => ({
          ...course,
          topic: topic.slug
        }))
      )
    },
    []
  )
  const topicSlugMap = await generateDbModelSlugMap(Topic, {
    slug: { $in: Object.keys(curriculum.topics) },
    published: true
  })
  const subtopicSlugMap = await generateDbModelSlugMap(Course, {
    slug: { $in: curriculumCourses.map(course => course.slug) },
    deprecated: false
  })

  const standards = curriculumCourses
    .reduce((standards, course) => {
      return standards.concat(
        course.standards.map(standard => ({
          ...standard.toJSON(),
          topic: topicSlugMap.get(course.topic),
          subtopic: subtopicSlugMap.get(course.slug)
        }))
      )
    }, [])
    .filter(standard => standard.objectives.length > 0)
  await Promise.all(standards.map(standard => Standard.insert(standard)))
}

run().then(async () => {
  console.log('script ran succesfully')
  await db.close()
  process.exit(0)
})

async function generateDbModelSlugMap (Model, query) {
  const map = new Map()
  const dbObjects = await Model.find(query, '_id slug')
  dbObjects.forEach(({ _id, slug }) => {
    map.set(slug, _id)
  })
  return map
}
