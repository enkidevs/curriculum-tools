const { getParser } = require('@enkidevs/curriculum-parser')
const { getCompiler: getStringCompiler } = require('@enkidevs/curriculum-compiler-string')
const { contentTypes } = require('@enkidevs/curriculum-helpers')
const unified = require('unified')
const markdown = require('remark-parse')
const find = require('unist-util-find')
const map = require('unist-util-map')
const visit = require('unist-util-visit')

const Content = require('./content')
const { removeEmptyObjectProperties, astRootNode } = require('./helpers')

const parser = getParser(contentTypes.INSIGHT)
const insightStringCompiler = getStringCompiler(contentTypes.INSIGHT)
const markdownCompiler = getStringCompiler(contentTypes.MARKDOWN)

/**
 * Given an insight string and its path, creates Insight object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Insight extends Content {
  constructor ({ body, path }) {
    super({ body, path })
    // HACK for code snippets without langauge
    // TODO: update content such that all code snippets have language
    this.topic = ''
    this.workout = ''
    this.course = ''
    this.ast = map(parser.parseSync(body), node => {
      if (node.type === 'code' && !node.lang) {
        return {
          ...node,
          // fallback to BASH
          lang: 'bash'
        }
      }
      return node
    })
  }

  /**
   * Generates markdown based on current ast
   * @returns {string} Markdown
   */
  render () {
    return insightStringCompiler.compileSync(this.ast)
  }

  /**
   * @returns {Object}
   */
  getMetadata () {
    const ast = this.ast
    const metadataNode = find(ast, { type: 'yaml' })
    return metadataNode.data.parsedValue
  }

  /**
   * @param {Object} Metadata to upsert
   * @returns {void}
   */
  setMetadata (metadata = {}) {
    const ast = this.ast
    const previousMetadata = find(ast, { type: 'yaml' }).data.parsedValue
    const newMetadata = Object.assign(previousMetadata, metadata)
    visit(ast, { type: 'yaml' }, node => { node.data.parsedValue = newMetadata })

    this.ast = ast
  }

  /**
   * @returns {string} Topic
   */
  getTopic () {
    return this.topic
  }

  /**
   * @param {string} Topic
   * @returns {void}
   */
  setTopic (topic) {
    if (typeof topic !== 'string') throw Error('Malformed Topic!')
    this.topic = topic
  }

  /**
   * @returns {string} Course
   */
  getCourse () {
    return this.course
  }

  /**
   * @param {string} Course
   * @returns {void}
   */
  setCourse (course = '') {
    if (typeof course !== 'string') throw Error('Malformed Course!')
    this.course = course
  }

  /**
   * @returns {string} Workout
   */
  getWorkout () {
    return this.workout
  }

  /**
   * @param {string} workout
   * @returns {void}
   */
  setWorkout (workout = '') {
    if (typeof workout !== 'string') throw Error('Malformed Workout!')
    this.workout = workout
  }

  /**
   * @returns {string}
   */
  getTitle () {
    const headlineNode = find(this.ast, { type: 'headline' })
    return compileAstNodeToInsight(headlineNode)
      .split('\n')
      .join('')
  }

  /**
   * @param {string} headline
   * @returns {void}
   */
  setTitle (headline = '') {
    if (typeof headline !== 'string') throw Error('Malformed title!')
    const ast = this.ast
    visit(ast, { type: 'headline' }, node => { node.children[0].value = headline })
    this.ast = ast
  }

  /**
   * @returns {string} Content
   */
  getContent () {
    const contentNode = find(this.ast, { type: 'section', name: 'Content' })
    if (contentNode) {
      return compileAstNodeToInsight(contentNode)
    }
  }

  /**
   * @param {markdown} newContent
   */
  setContent (newContent = '') {
    this.ast = injectMarkdownToAst('Content', newContent, this.ast)
  }

  /**
   * @returns {Object} Exercise
   * @returns {Object} Exercise
   */
  getExercise () {
    const exerciseNode = find(this.ast, { type: 'section', name: 'Exercise' })
    if (exerciseNode) {
      return extractExercise(this.getMetadata(), exerciseNode)
    }
  }

  /**
   * @param {string} markdown Exercise Markdown
   */
  setExercise (newExercise = '') {
    this.ast = injectMarkdownToAst('Exercise', newExercise, this.ast)
  }

  /**
   * @returns {string} Game Content
   */
  getGameContent () {
    const gameContent = find(this.ast, { type: 'section', name: 'Game Content' })
    if (gameContent) {
      return compileAstNodeToInsight(gameContent)
    }
  }

  /**
   * @param {string} markdown Game Content
   * @returns {void}
   */
  setGameContent (newGameContent = '') {
    this.ast = injectMarkdownToAst('Game Content', newGameContent, this.ast)
  }

  getImages () {
    return extractSvgsFromAstNode(this.ast)
  }

  /**
   * @returns {Object} Practice Question
   */
  getPracticeQuestion () {
    const practiceQuestionNode = find(this.ast, { type: 'section', name: 'Practice' })
    if (practiceQuestionNode) {
      return extractQuestionFromAstNode(practiceQuestionNode)
    }
  }

  /**
   * @param {string} markdown Practice Question Markdown
   * @returns {void}
   */
  setPracticeQuestion (practiceQuestionMarkdown) {
    this.ast = injectMarkdownToAst('Practice', practiceQuestionMarkdown, this.ast)
  }

  /**
   * @returns {Object} Revision Question
   */
  getRevisionQuestion () {
    const revisionQuestionNode = find(this.ast, { type: 'section', name: 'Revision' })
    if (revisionQuestionNode) {
      return extractQuestionFromAstNode(revisionQuestionNode)
    }
  }

  /**
   * @param {Object} markdown Revision Question Markdown
   * @returns {void}
   */
  setRevisionQuestion (revisionQuestionMarkdown = '') {
    this.ast = injectMarkdownToAst('Revision', revisionQuestionMarkdown, this.ast)
  }

  /**
   * @returns {Object} Quiz - Values for Quiz
   * @returns {string} Quiz.headline
   * @returns {string} Quiz.question
   * @returns {string} Quiz.answer
   */
  getQuiz () {
    const quizNode = find(this.ast, { type: 'section', name: 'Quiz' })
    if (quizNode) {
      return extractQuizFromAstNode(quizNode)
    }
  }

  /**
   * @param {string} quizMarkdown
   * @returns {void}
   */
  setQuiz (quizMarkdown = '') {
    this.ast = injectMarkdownToAst('Quiz', quizMarkdown, this.ast)
  }

  /**
   * @returns {string} Footnotes text
   */
  getFootnotes () {
    const footnotesNode = find(this.ast, { type: 'section', name: 'Footnotes' })
    if (footnotesNode) {
      return compileAstNodeToInsight(footnotesNode)
    }
  }

  /**
   * @param {string} footnotesText
   */
  setFootnotes (footnotesText = '') {
    this.ast = injectMarkdownToAst('Footnotes', footnotesText, this.ast)
  }

  // #TODO: Replace this with AST => JSON compiler
  /**
   * @returns {Object}
   */
  toJSON () {
    const astMetadata = this.getMetadata()
    return removeEmptyObjectProperties({
      slug: this.slug,
      headline: this.getHeadline(),
      author: astMetadata.author,
      category: astMetadata.category,
      standards: astMetadata.standards,
      type: astMetadata.type,
      tags: astMetadata.tags,
      inAlgoPool: astMetadata.inAlgoPool,
      stub: astMetadata.stub,
      levels: astMetadata.levels,
      links: astMetadata.links,
      aspects: astMetadata.aspects,
      content: this.getContent(),
      images: this.getImages(),
      exercise: this.getExercise(),
      gameContent: this.getGameContent(),
      practiceQuestion: (this.getPracticeQuestion() || {}).rawText,
      revisionQuestion: (this.getRevisionQuestion() || {}).rawText,
      quiz: this.getQuiz(),
      footnotes: this.getFootnotes()
    })
  }
}

function compileAstNodeToInsight (node) {
  if (!node || !node.children) {
    return undefined
  }
  return insightStringCompiler.compileSync(astRootNode(node.children))
}

/**
 * @typedef {Object} QuestionObject
 * @property {string} text
 * @property {string} rawText
 * @property {Array.<string>} answers
 */

/**
 *
 * @param {Object} AST_Node Question Node
 * @returns {QuestionObject} Question Object
 */
function extractQuestionFromAstNode (questionNode) {
  if (!questionNode) {
    return undefined
  }
  let { children: childrenNodes } = questionNode
  const rawText = compileAstNodeToInsight(questionNode)
  const text = compileAstNodeToInsight({
    children: childrenNodes.filter(node => node.type !== 'list')
  })

  const questionAnswersNode = childrenNodes.find(node => node.type === 'list')
  if (!questionAnswersNode) {
    console.log(
      'Deprecation warning: no markdown answers list found in question.'
    )
    console.log('Bullet points should be appendend with an whitespace')
  }
  // SKIP parsing questions with no md answer lists
  // nothing is broken right now as we only use the rawtext on clients
  // ideally, have all content changed with proper markdown
  const answers = questionAnswersNode
    ? markdownCompiler
      .compileSync(questionAnswersNode)
      .split('\n')
      .filter(Boolean)
      .map(i => i.substring(1).trim())
    : []

  return {
    rawText,
    text,
    answers
  }
}

/**
 * @typedef {Object} QuizObject
 * @property {string} headline
 * @property {string} question
 * @property {Array.<string>} answers
 */

/**
 *
 * @param {Object} AST_Node Quiz Node
 * @returns {QuizObject} Quiz Object
 */

function extractQuizFromAstNode (quizNode) {
  if (!quizNode) {
    return undefined
  }
  const { children: childrenNodes } = quizNode
  return {
    headline: compileAstNodeToInsight(
      childrenNodes.find(node => node.type === 'questionHeadline')
    ),
    question: compileAstNodeToInsight({
      children: childrenNodes.filter(
        node => node.type !== 'questionHeadline' && !node.answers
      )
    }),
    answers: markdownCompiler
      .compileSync(childrenNodes.find(node => node.type === 'list'))
      .split('\n')
      .filter(Boolean)
      .map(i => i.substring(1).trim())
  }
}

/**
 *
 * @param {Object}
 * @param {Object} AST_Node
 */
function extractExercise ({ link = '', linkType = '', answer = '' } = {}, node) {
  const exerciseNodeChildrenWithoutHeadline = node.children.filter(
    node => node.type !== 'questionHeadline'
  )
  return {
    link,
    linkType,
    question: compileAstNodeToInsight({
      children: exerciseNodeChildrenWithoutHeadline
    }),
    ...(answer && { answer })
  }
}

function extractSvgsFromAstNode (ast) {
  if (!ast) {
    return
  }
  const images = []
  visit(ast, { type: 'image' }, node => images.push(node))

  return images.map(svg => ({
    slug: svg.alt || svg.title,
    encodedString: svg.url
  }))
}

/**
 *
 * @param {string} sectionName Case-sensitive name of section
 * @param {string} newMarkdown Markdown string
 * @param {Object} ast AST to update
 */
function injectMarkdownToAst (sectionName = '', newMarkdown = '', ast) {
  if (typeof sectionName !== 'string') {
    throw Error('Section name should be a string')
  }
  if (typeof newMarkdown !== 'string') {
    throw Error('Markdown should be a string')
  }
  const newAst = unified()
    .use(markdown)
    .parse(newMarkdown)

  visit(ast, {
    type: 'section',
    name: sectionName
  }, node => {
    node.children = newAst.children
  })
  return ast
}
