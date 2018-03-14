
const yaml = require('js-yaml')
const Content = require('./content')
const { removeEmptyObjectProperties, getMarkdownLink } = require('./helpers')
const {
  getParser,
  types
} = require('@enkidevs/curriculum-parser')
const parser = getParser(types.INSIGHT)
const visit = require('unist-util-visit')

/**
 * Given an insight string and its path, creates Insight object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Insight extends Content {
  constructor ({ body, path}) {
    // allow vFile without changing interface
    if (body.cwd && body.contents) {
      body = body.contents
    }
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
    visit(ast, (node, index, parent) => {
      // yaml nodes
      if (node.type === 'yaml') this.yaml = node.data.parsedValue
      if (node.type === 'headline') this.title = node.value
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
        // handle footnote sections
        if (node.name === 'Footnotes') {
          this.footnotes = node.parsedValue
        }
        // handle question sections
        if (node.name === 'Practice') {
          this.practiceQuestion = {
            answers: node.children.pop().children,
            text: parser.stringifySync(node)
          }
        }
        if (node.name === 'Revision') {
          this.revisionQuestion = {
            answers: node.children.pop().children,
            text: parser.stringifySync(node)
          }
        }
        if (node.name === 'Quiz') { 
          this.quizQuestion = {
            answers: node.children.pop().children,
            headline: node.children.filter((node) => { return node.type == "heading" && node.depth === 3 })[0],
            text: parser.stringifySync(node)
          }
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
