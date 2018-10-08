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
const doc = new Document(undefined, {
  top: 500,
  right: 500,
  bottom: 500,
  left: 500
})

doc.createParagraph('Blockchain on Enki').title()
doc.addParagraph(createHeading('Metadata'))
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
    const descriptionParagraph = new Paragraph()
    const descriptionTextRun = new TextRun(`\t${workout.description}`).italic()
    descriptionParagraph.addRun(descriptionTextRun)
    doc.addParagraph(descriptionParagraph)
  })
})
doc.createParagraph('\n')

workouts.forEach((workout, i) => {
  doc.addParagraph(new Paragraph(`Lesson ${i}: ${workout.name}`).heading2())
  doc.createParagraph('\n')
  doc.addParagraph(new Paragraph(workout.description))
  doc.createParagraph('\n')

  workout.insights.forEach((insight, index) => {
    const insightTitle = new TextRun(insight.headline).color('a518a3')
    const insightTitleParagraph = new Paragraph().heading3()
    insightTitleParagraph.addRun(insightTitle)
    doc.addParagraph(insightTitleParagraph)
    doc.createParagraph('\n').leftTabStop()

    const explanationParagraphs = convertMarkdownToParagraphs(
      get(insight, 'content', 'none')
    )
    explanationParagraphs.forEach(paragraph => {
      doc.addParagraph(paragraph)
    })

    doc.addParagraph(new Paragraph('Practice Question').heading4())

    const pqParagraphs = convertMarkdownToParagraphs(
      get(insight, 'practiceQuestion.rawText', 'none')
    )
    doc.createParagraph('\n')
    pqParagraphs.forEach(paragraph => {
      doc.addParagraph(paragraph)
    })

    doc.addParagraph(new Paragraph('Revision Question').heading4())
    doc.createParagraph('\n')

    const rqParagraphs = convertMarkdownToParagraphs(
      get(insight, 'revisionQuestion.rawText', 'none')
    )
    rqParagraphs.forEach(paragraph => {
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
