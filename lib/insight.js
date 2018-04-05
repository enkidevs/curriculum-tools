const { getParser } = require('@enkidevs/curriculum-parser')
const { getCompiler } = require('@enkidevs/curriculum-compiler-string')
const { contentTypes } = require('@enkidevs/curriculum-helpers')
const find = require('unist-util-find')
const map = require('unist-util-map')

const Content = require('./content')
const { removeEmptyObjectProperties, astRootNode } = require('./helpers')
const { CURRICULUM_BASE_URL } = require('./constants')

const parser = getParser(contentTypes.INSIGHT)
const insightStringCompiler = getCompiler(contentTypes.INSIGHT)
const markdownCompiler = getCompiler(contentTypes.MARKDOWN)

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
  }

  updateFromAst (ast) {
    const metadataNode = find(ast, { type: 'yaml' })
    this.metadata = metadataNode.data.parsedValue

    const headlineNode = find(ast, { type: 'headline' })
    this.headline = compileAstNodeToInsight(headlineNode)
      .split('\n')
      .join('')

    const insightType = this.metadata.type
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
      const contentNode = find(ast, { type: 'section', name: 'Content' })
      this.content = compileAstNodeToInsight(contentNode)

      const practiceNode = find(ast, { type: 'section', name: 'Practice' })
      this.practiceQuestion = extractQuestionFromAstNode(practiceNode)

      const revisionNode = find(ast, { type: 'section', name: 'Revision' })
      this.revisionQuestion = extractQuestionFromAstNode(revisionNode)

      const footnotesNode = find(ast, { type: 'section', name: 'Footnotes' })
      this.footnotes = compileAstNodeToInsight(footnotesNode)

      const quizNode = find(ast, { type: 'section', name: 'Quiz' })
      this.quiz = extractQuizFromAstNode(quizNode)

      const gameContent = find(ast, { type: 'section', name: 'Game Content' })
      this.gameContent = compileAstNodeToInsight(gameContent)
    }
  }

  /**
   * Generates markdown based on current ast
   * @returns {string} Markdown
   */
  render () {
    insightStringCompiler.compileSync(this.ast)
  }

  setTopic (topic) {
    this.topic = topic
  }

  setCourse (course) {
    this.course = course
  }

  setWorkout (workout) {
    this.workout = workout
  }

  getExternalLink () {
    return `${CURRICULUM_BASE_URL}/tree/master/${this.topic}/${this.course}/${
      this.workout
    }/${this.slug}.md`
  }

  toJSON () {
    return removeEmptyObjectProperties({
      slug: this.slug,
      headline: this.headline,
      author: this.metadata.author,
      category: this.metadata.category,
      standards: this.metadata.standards,
      type: this.metadata.type,
      tags: this.metadata.tags,
      inAlgoPool: this.metadata.inAlgoPool,
      stub: this.metadata.stub,
      levels: this.metadata.levels,
      links: this.metadata.links,
      content: this.content,
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
    question: compileAstNodeToInsight(
      childrenNodes.find(node => node.type === 'paragraph')
    ),
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
