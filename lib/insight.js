const { getParser } = require('@enkidevs/curriculum-parser')
const { getCompiler: getStringCompiler } = require('@enkidevs/curriculum-compiler-string')
// const { getCompiler: getJsonCompiler } = require('@enkidevs/curriculum-compiler-json')
const { contentTypes } = require('@enkidevs/curriculum-helpers')
const find = require('unist-util-find')
const map = require('unist-util-map')
const visit = require('unist-util-visit')

const Content = require('./content')
const { removeEmptyObjectProperties, astRootNode } = require('./helpers')
const { CURRICULUM_BASE_URL } = require('./constants')

const parser = getParser(contentTypes.INSIGHT)
const insightStringCompiler = getStringCompiler(contentTypes.INSIGHT)
const markdownCompiler = getStringCompiler(contentTypes.MARKDOWN)
// const jsonCompiler = getJsonCompiler(contentTypes.INSIGHT)

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

    this.updateFromAst(this.ast)
    // console.log(this.ast)
  }

  updateFromAst (ast) {
    // const metadataNode = find(ast, { type: 'yaml' })
    // this.metadata = metadataNode.data.parsedValue

    const insightType = this.getMetadata().type
    if (insightType === 'exercise') {
      const exerciseNode = find(ast, { type: 'section', name: 'Exercise' })
      this.exercise = extractExercise(this.metadata, exerciseNode)
    } else if (
      [
        'normal',
        'fillTheGap',
        'bugSpot',
        'evaluateThis',
        'refactor',
        'tetris'
      ].includes(insightType)
    ) {
      this.images = extractSvgsFromAstNode(ast)

      const footnotesNode = find(ast, { type: 'section', name: 'Footnotes' })
      this.footnotes = compileAstNodeToInsight(footnotesNode)

      const gameContent = find(ast, { type: 'section', name: 'Game Content' })
      this.gameContent = compileAstNodeToInsight(gameContent)
    }
  }

  /**
   * Generates markdown based on current ast
   * @returns {string} Markdown
   */
  render () {
    return insightStringCompiler.compileSync(this.ast)
  }
  /**
   * @returns {object}
   */
  getMetadata () {
    const ast = this.ast
    const metadataNode = find(ast, { type: 'yaml' })
    return metadataNode.data.parsedValue
  }
  /**
   * @param {object} Metadata to upsert
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
  setCourse (course) {
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
  setWorkout (workout) {
    if (typeof workout !== 'string') throw Error('Malformed Workout!')
    this.workout = workout
  }
  /**
   * @returns {string}
   */
  getHeadline () {
    const headlineNode = find(this.ast, { type: 'headline' })
    console.log(headlineNode)
    return compileAstNodeToInsight(headlineNode)
      .split('\n')
      .join('')
  }
  /**
 * @param {string} headline
 * @returns {void}
 */
  setHeadline (headline) {
    if (typeof headline !== 'string') throw Error('Malformed headline!')
    const ast = this.ast
    visit(ast, { type: 'headline' }, node => { node.children[0].value = headline })
    this.ast = ast
  }

  /**
   * @returns {string} Content
   */
  getContent () {
    const contentNode = find(this.ast, { type: 'section', name: 'Content' })
    return compileAstNodeToInsight(contentNode)
  }

  /**
   *
   * @param {string} newContent
   */
  setContent (newContent = '') {
    const ast = this.ast
    const newContentAST = parser.parseSync(newContent)
    // #TODO: Determine if this is the best way to swap out an arbitrary node between two trees
    const newContentNode = find(newContentAST, { type: 'section', name: 'Content' })

    visit(ast, { type: 'section', name: 'Content' }, node => newContentNode)
    this.ast = ast
  }

  /**
   * @returns {object}
   */
  getGameContent () {
    const gameContent = find(this.ast, { type: 'section', name: 'Game Content' })
    return compileAstNodeToInsight(gameContent)
  }
  /**
   * @param {AST Node} gameContentNode
   * @returns {void}
   */
  setGameContent (gameContentNode) {
    const ast = this.ast
    visit(ast, { type: 'section', name: 'Game Content' }, node => gameContentNode)
    this.ast = ast
  }
  /**
   * @returns {string} Link to file on Github
   */
  getExternalLink () {
    return `${CURRICULUM_BASE_URL}/tree/master/${this.topic || ''}/${this.course || ''}/${
      this.workout || ''
    }/${this.slug || ''}.md`
  }
  /**
   * @returns {object} Practice Question
   */
  getPracticeQuestion () {
    const practiceNode = find(this.ast, { type: 'section', name: 'Practice' })
    return extractQuestionFromAstNode(practiceNode)
  }

  /**
   * @param {AST Node} practiceQuestionNode
   * @returns {void}
   */
  setPracticeQuestion (practiceQuestionNode) {
    const ast = this.ast
    visit(ast, { type: 'section', name: 'Practice' }, node => practiceQuestionNode)
    this.ast = ast
  }

  /**
   * @returns {object} Revision Question
   */
  getRevisionQuestion () {
    const revisionQuestionNode = find(this.ast, { type: 'section', name: 'Revision' })
    return extractQuestionFromAstNode(revisionQuestionNode)
  }

  /**
   * @param {AST Node} revisionQuestionNode
   * @returns {void}
   */
  setRevisionQuestion (revisionQuestionNode) {
    const ast = this.ast
    visit(ast, { type: 'section', name: 'Revision' }, node => revisionQuestionNode)
    this.ast = ast
  }
  /**
   * @returns {AST Node} Quiz node
   */
  getQuiz () {
    const quizNode = find(this.ast, { type: 'section', name: 'Quiz' })
    return extractQuizFromAstNode(quizNode)
  }
  /**
   * @param {object}
   */
  setQuiz (quizObj) {
    const ast = this.ast
    visit(ast, { type: 'section', name: 'Quiz' }, node => quizObj)
    this.ast = ast
  }

  // #TODO: Replace this with AST => JSON compiler
  /**
   * @returns {object}
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
      images: this.images,
      exercise: this.exercise,
      gameContent: this.gameContent,
      practiceQuestion: (this.practiceQuestion || {}).rawText,
      reviseQuestion: (this.revisionQuestion || {}).rawText,
      quiz: this.quiz,
      footnotes: this.footnotes
    })
  }
}

function compileAstNodeToInsight (node) {
  if (!node || !node.children) {
    return undefined
  }
  return insightStringCompiler.compileSync(astRootNode(node.children))
}

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

function extractExercise ({ link, linkType, answer }, node) {
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
