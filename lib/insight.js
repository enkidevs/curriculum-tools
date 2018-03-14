
const yaml = require('js-yaml')
const Content = require('./content')
const { removeEmptyObjectProperties, getMarkdownLink } = require('./helpers')
const {
  getParser,
  types
} = require('@enkidevs/curriculum-parser')
const parser = getParser(types.INSIGHT)
const visit = require('unist-util-visit')
const find = require('unist-util-find')

/**
 * Given an insight string and its path, creates Insight object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Insight extends Content {
  constructor ({ body, path}) {
    super({ body, path })
    try {
      this.ast = parser.parseSync(body)
      this.parse(this.ast, null, 2)
    } catch (err) {
      console.log(err)
      console.error(`Problem with ${this.contentPath}`)
      throw err
    }
  }

  parse (ast) {
    this.yaml = find(ast, {type: 'yaml'}).data.parsedValue
    this.title = find(ast, {type: 'headline'})
    console.log(this.title)
    if (this.yaml.type === 'exercise') {
      // insight is an exercise
      this.content = find(ast, {name: 'Exercise'}).value
    }
    if (this.yaml.type === 'normal') {
      // handle footnote sections
      this.footnotes = find(ast, {name: 'Footnotes'})
      
      // handle question sections
      let practiceQuestion = find(ast, { name: 'Practice' })
      if (practiceQuestion) {
        this.practiceQuestion = {
          answers: practiceQuestion.children.pop(),
          text: parser.stringifySync(practiceQuestion)
        }
      }

      let revisionQuestion = find(ast, { name: 'Revision' })
      if (revisionQuestion) {
        this.revisionQuestion = {
          answers: revisionQuestion.children.pop(),
          text: parser.stringifySync(revisionQuestion)
        }
      }

      let quizQuestion = find(ast, { name: 'Quiz' })
      if (quizQuestion) {
        this.quizQuestion = {
          answers: quizQuestion.children.pop(),
          headline: quizQuestion.children.filter((node) => { return node.type == 'heading' && node.depth === 3 })[0],
          text: parser.stringifySync(quizQuestion)
        }
      }
    }
    visit(ast, (node, index, parent) => {
      if (node.type === 'section') {
        // handle exercise sections
        if (this.yaml.type === 'exercise' && node.name === 'Exercise') {
          this.exercise = node.parsedValue
        }
        // handle content sections
        if (this.yaml.type === 'normal' && node.name === 'Content') {
          this.content = node.parsedValue
        }
        // handle game sections
        if (this.yaml.type !== 'normal' && node.name === 'Game Content') {
          this.gameContent = node.parsedValue
        }
      }
    })
  }

  /**
   * Generates markdown based on current ast
   * @returns {string} Markdown
   */
  render () {
    parser.stringifySync(this.ast)
  }

  toJSON () {
    return removeEmptyObjectProperties({
      slug: this.slug,
      headline: this.title,
      author: this.yaml.author,
      category: this.yaml.category,
      type: this.yaml.type,
      tags: this.yaml.tags,
      inAlgoPool: this.yaml.inAlgoPool,
      stub: this.yaml.stub,
      levels: this.yaml.levels,
      links: this.yaml.links,
      content: this.content,
      exercise: this.exercise,
      gameContent: this.gameContent,
      practiceQuestion: {
        text: this.practiceQuestion.text,
        answers: this.practiceQuestion.answers
      },
      reviseQuestion: {
        text: this.revisionQuestion.text,
        answers: this.revisionQuestion.answers
      },
      quiz: this.quizQuestion,
      footnotes: this.footnotes
    })
  }
}
