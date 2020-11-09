const { getParser } = require('@enkidevs/curriculum-parser-markdown')
const { getCompiler } = require('@enkidevs/curriculum-compiler-json')
const { getCompiler: getStringCompiler } = require('@enkidevs/curriculum-compiler-string')
const { contentTypes } = require('@enkidevs/curriculum-helpers')

const Content = require('./content')
const { CURRICULUM_BASE_URL } = require('./constants')

const parser = getParser(contentTypes.INSIGHT)
const jsonCompiler = getCompiler(contentTypes.INSIGHT)
const stringCompiler = getStringCompiler(contentTypes.MARKDOWN)

module.exports = class Insight extends Content {
  constructor ({ body, path }) {
    super({ body, path })

    const ast = parser.parseSync(body)
    const compiledInsight = jsonCompiler.compileSync(ast)

    this.fullJSON = compiledInsight
    Object.keys(compiledInsight).forEach(jsonKey => {
      this[jsonKey] = compiledInsight[jsonKey]
    })
  }

  render () {
    return stringCompiler.compileSync(this.ast)
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
    return `${CURRICULUM_BASE_URL}/tree/master/${this.topic}/${this.course}/${this.workout}/${this.slug}.md`;
  }

  toJSON () {
    return this.fullJSON
  }
};
