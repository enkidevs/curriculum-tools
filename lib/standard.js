//* * Standards cli helper functions, for ease of creation and statistics **/
const os = require('os')
const Content = require('./content')

/**
 * Given a standards path, creates a nested Standards object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Standards extends Content {
  constructor ({ body, path }) {
    super({ body, path })
    let pathParts = path.split('/')
    pathParts.pop() // remove standard filename, not slug
    this.courseSlug = pathParts.pop()
    this.topicSlug = pathParts.pop()
    this.parse(this.rawText)
  }

  parse (rawText) {
    let lines = rawText.split('\n')
    const OBJECTIVES_BEGIN_REGEX = /0. /
    const DESCRIPTION_REGEX = /## Description/
    const SECTION_END_REGEX = /\-{3}/

    this.name = lines[0].replace('# ', '')
    // get slug
    this.slug = lines
      .find(line => {
        return line.startsWith('slug: ')
      })
      .replace('slug: ', '')

    const objectivesStartIndex = lines.findIndex(line => {
      return line.match(OBJECTIVES_BEGIN_REGEX)
    })
    const objectivesEnd = lines.findIndex((line, i) => {
      return i >= objectivesStartIndex ? line.match(SECTION_END_REGEX) : false
    })

    const objectives = lines
      .slice(objectivesStartIndex, objectivesEnd)
      .filter(line => {
        return line.trim().length > 1
      })
    this.objectives = objectives.map((line, i) => {
      return line.replace('- ', '').replace(/\d+\.\s/, '')
    })
    const descriptionStartIndex = lines.findIndex(line => {
      return line.match(DESCRIPTION_REGEX)
    })
    const descriptionEnd = lines.findIndex((line, i) => {
      return i > descriptionStartIndex ? line.match(SECTION_END_REGEX) : false
    })

    this.description = lines
      .slice(descriptionStartIndex, descriptionEnd)
      .join('\n')
      .replace('## Description\n', '')
  }

  toJSON () {
    let objectives = this.objectives.map((objective, i) => {
      return {
        slug: `${this.slug}.${i}`,
        ordinalValue: i,
        text: objective
      }
    })
    return {
      slug: this.slug,
      name: this.name,
      description: this.description,
      objectives
    }
  }

  /**
   * Generates markdown based on current object properties
   * @returns {string} Markdown
   */
  render () {
    return ```# ${this.name}

slug: ${this.slug}

## Description

${this.description}

---
## Objectives
In order to fully cover this standard, a performance must be recorded for each of the following objectives:

${this.objectives
    .map((o, i) => {
      return `${i}. ${o}`
    })
    .join('\n')}

```
  }
}
