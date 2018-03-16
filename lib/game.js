const yaml = require('js-yaml')
const Content = require('./content')
const { removeEmptyObjectProperties, getMarkdownLink } = require('./helpers')
// for reading Games from a file, and also for writing to files.
// Not meant to be the main parser, just meant to provide an abstraction for dealing with lots of curriculum.

const extractSection = ({ rawText, sectionTitle }) => {
  let startIndex = rawText.indexOf(sectionTitle) + sectionTitle.length + 1

  if (startIndex === sectionTitle.length) {
    return null
  }
  let endIndex =
    rawText.indexOf('---', startIndex) === -1
      ? rawText.length
      : rawText.indexOf('---', startIndex)
  let tempcontent = rawText.substring(startIndex, endIndex).trim()

  return tempcontent
}

/**
 * Takes Games markdown and returns array of questions
 * @param {string} rawText
 * @returns {object}
 */
const parseGames = ({ rawText, type }) => {
  switch (type) {
    case 'fillTheGap':
      return (() => {
        let startIndex =
          rawText.indexOf('Game Content') + 'Game Content'.length + 1
        let questionsArr = rawText
          .substring(startIndex)
          .split('---')
          .map(x => x.trim())
        let output = []
        questionsArr.map(question => {
          let data = {}
          data.question = question.split('```')[1].trim()
          let answerSubStr = question.split('```')[2].trim()
          data.answers = answerSubStr
            .substring(0, answerSubStr.indexOf('%exp'))
            .trim()
            .split(/\n*\* /)
            .slice(1)

          if (question.indexOf('%exp') != 1) {
            data.explaination = question
              .substring(
                question.lastIndexOf('%exp') + 4,
                question.lastIndexOf('%')
              )
              .trim()
          }

          output.push(data)
        })
        return output
      })()
      break
    case 'tetris':
      return (() => {
        let startIndex =
          rawText.indexOf('Game Content') + 'Game Content'.length + 1
        let gameString = rawText.substring(startIndex).trim()
        let output = { answers: [] }
        ;[output.left, output.right] = gameString
          .split('\n')[0]
          .split(':')
          .map(x => {
            return x.trim()
          })

        let falseSet = gameString
          .substring(
            gameString.indexOf('```false\n') + 8,
            gameString.indexOf('```\n')
          )
          .trim()
          .split('%\n')
        for (let question of falseSet) {
          let data = {}
          data.value = false
          ;[data.text, data.explaination] = question.split('%exp').map(x => {
            return x.trim()
          })
          output.answers.push(data)
        }
        var tempStr = gameString.substring(gameString.indexOf('```true\n') + 7)
        let trueSet = tempStr
          .substring(0, gameString.lastIndexOf('```'))
          .trim()
          .split('%\n')
        for (let question of trueSet) {
          let data = {}
          data.value = true
          ;[data.text, data.explaination] = question.split('%exp').map(x => {
            return x.trim()
          })
          output.answers.push(data)
        }

        return output
      })()
      break
    default:
      throw new Error(`Game type ${type} not found`)
      break
  }
}

/**
 * Given a game string and its path, creates Game object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Game extends Content {
  constructor ({ body, path }) {
    // Should take an object
    // Content reader and writer should combine into ReaderWriter and live in curriculum
    // Each one of the contentType files (Course/Game ...) should take in the text and path
    /**
    new Content({body: text, path: path})
    **/
    super({ body, path })

    this.parent = null
    this.links = null
    this.parse(this.rawText)
  }

  parse (text) {
    this.title = text.substring(2, text.indexOf('\n'))
    this.content = extractSection({
      rawText: text,
      sectionTitle: '## Content'
    })
    yaml.safeLoadAll(text.split('---')[0], doc => {
      for (const prop in doc) {
        this[prop] = doc[prop]
      }
    })
    this.game = parseGames({
      rawText: text,
      type: this.type
    })

    if (this.links) {
      this.links = this.links.map(getMarkdownLink)
    }
  }

  /**
   * Generates markdown based on current object properties
   * @returns {string} Markdown
   */
  render () {
    let markdown = ''

    // Title
    markdown += `# ${this.title}\n`
    // Author
    if (this.author != null) {
      markdown += `author: ${this.author}\n\n`
    }
    // Levels
    if (this.levels != null) {
      markdown += 'levels:\n\n'
      for (let i in this.levels) {
        markdown += `  - ${this.levels[i]}\n\n`
      }
    }

    // Type with fallback
    markdown += `type: ${this.type || 'normal'}\n\n`
    // Category with fallback
    markdown += `category: ${this.category || 'must-know'}\n\n`
    // Parent
    if (this.parent != null) markdown += `parent: ${this.parent}\n\n`
    // Standards
    if (this.standards != null) {
      markdown += 'standards:\n\n'
      for (let i in this.standards) {
        markdown += `  - ${i}: ${this.standards[i]}\n\n`
      }
    }
    // Tags
    if (this.tags != null) {
      markdown += 'tags:\n\n'
      for (let i in this.tags) {
        markdown += `  - ${this.tags[i]}\n\n`
      }
    }

    // Links
    if (this.links != null && this.links.length > 0) {
      markdown += 'links:\n\n'
      for (let i in this.links) {
        markdown += `  - >-\n    ${this.links[i]}\n\n`
      }
    }

    // Content
    markdown += `---\n## Content\n\n${this.content}\n\n`

    // return new game file text
    return markdown
  }

  toJSON () {
    return removeEmptyObjectProperties({
      slug: this.slug,
      headline: this.title,
      author: this.author,
      category: this.category,
      type: this.type,
      tags: this.tags,
      inAlgoPool: this.inAlgoPool,
      stub: this.stub,
      levels: this.levels,
      links: this.links,
      content: this.content,
      gameContent: this.gameContent,
      footnotes: this.footnotes
    })
  }
}
