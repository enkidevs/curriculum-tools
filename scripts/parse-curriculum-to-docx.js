const flatten = require('lodash.flatten')
const get = require('lodash.get')
const docx = require('docx')
const fs = require('fs')

const GitHub = require('../lib/networking/github')
const Curriculum = require('../lib/curriculum')
const git = new GitHub('./test-data/')

const branchName = process.argv[2] || 'master'

if (git.getGitBranch() !== branchName) {
  git.checkoutGitBranch(branchName)
}

const curriculum = new Curriculum(git)
const { Document, Paragraph, Packer, TextRun } = docx

const Topic = curriculum.topics.blockchain
const workouts = flatten(
  Topic.getOrderedCourses().map(course => course.getOrderedWorkouts())
)
const doc = new Document()

doc.createParagraph('Blockchain on Enki').title()
doc.createParagraph('\n')
doc.createParagraph('\n')
doc.addParagraph(createHeading('Metadata'))
doc.createParagraph('\n')
doc.addParagraph(createKeyValueParagraph('Name', Topic.name))
doc.createParagraph('\n')
doc.addParagraph(createKeyValueParagraph('Description', Topic.description))
doc.createParagraph('\n')
doc.addParagraph(
  createKeyValueParagraph(
    'Courses',
    Topic.getOrderedCourses()
      .map(({ name }) => name)
      .join(' ')
  )
)
doc.createParagraph('\n')
doc.addParagraph(createHeading('Lessons'))
doc.createParagraph('\n')
doc.createParagraph(
  'The following lessons will be served in the order of their appearance'
)
doc.createParagraph('\n')
Topic.getOrderedCourses().forEach(course => {
  const boldText = new TextRun(`${course.name}: `).bold()
  const courseNameParagraph = new Paragraph()
  courseNameParagraph.addRun(boldText)
  doc.addParagraph(courseNameParagraph)
  course.getOrderedWorkouts().forEach(workout => {
    doc.addParagraph(new Paragraph(workout.name).bullet())
  })
})
doc.createParagraph('\n')

workouts.forEach((workout, i) => {
  const workoutTitle = new TextRun(`Lesson ${i}: ${workout.name}`).underline()
  const workoutParagraph = new Paragraph()
  workoutParagraph.addRun(workoutTitle)
  workoutParagraph.heading3()
  doc.addParagraph(workoutParagraph)
  doc.createParagraph('\n')
  doc.addParagraph(createKeyValueParagraph('Description', workout.description))
  doc.createParagraph('\n')

  workout.insights.forEach((insight, index) => {
    const insightNumber = new TextRun(`Insight ${index + 1}: `).bold()
    const insightTitle = new TextRun(insight.headline).color('a518a3')
    const insightTitleParagraph = new Paragraph()
    insightTitleParagraph.addRun(insightNumber)
    insightTitleParagraph.addRun(insightTitle)
    doc.addParagraph(insightTitleParagraph)
    doc.createParagraph('\n').leftTabStop()

    doc.addParagraph(createBoldParagraph('Content:').indent({ left: 300 }))
    doc.createParagraph('\n')

    const explanationParagraphs = convertMarkdownToParagraphs(
      get(insight, 'content', 'none')
    )
    explanationParagraphs.forEach(paragraph => {
      paragraph.indent({ left: 300 })
      doc.addParagraph(paragraph)
    })
    doc.createParagraph('\n')

    doc.addParagraph(
      createBoldParagraph('Practice Question:').indent({ left: 300 })
    )
    doc.createParagraph('\n')

    const pqParagraphs = convertMarkdownToParagraphs(
      get(insight, 'practiceQuestion.rawText', 'none')
    )
    pqParagraphs.forEach(paragraph => {
      paragraph.indent({ left: 300 })

      doc.addParagraph(paragraph)
    })
    doc.createParagraph('\n')

    doc.addParagraph(
      createBoldParagraph('Revision question:').indent({ left: 300 })
    )
    doc.createParagraph('\n')

    const rqParagraphs = convertMarkdownToParagraphs(
      get(insight, 'revisionQuestion.rawText', 'none')
    )
    doc.createParagraph('\n \t')
    rqParagraphs.forEach(paragraph => {
      paragraph.indent({ left: 300 })
      doc.addParagraph(paragraph)
    })
    doc.createParagraph('\n')
  })
})

const packer = new Packer()
packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('blockchain.doc', buffer)
  console.log('done')
  process.exit(0)
})

function createKeyValueParagraph (key, value) {
  const paragraph = new Paragraph()
  const keyText = new TextRun(`${key}: `).bold()
  paragraph.addRun(keyText)
  paragraph.addRun(new TextRun(value))
  return paragraph
}

function createBoldParagraph (value) {
  const textRun = new TextRun(value).bold()
  const paragraph = new Paragraph()
  paragraph.addRun(textRun)
  return paragraph
}

function createHeading (value) {
  const textRun = new TextRun(value)
    .size(25)
    .bold()
    .color('000')
    .underline()
  const paragraph = new Paragraph()
  paragraph.addRun(textRun)
  paragraph.heading1()
  return paragraph
}

function convertMarkdownToParagraphs (markdownText) {
  return markdownText.split('\n').map(x => new Paragraph(x))
}
