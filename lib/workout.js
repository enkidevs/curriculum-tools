const yaml = require('js-yaml')
const Content = require('./content')
const { removeEmptyObjectProperties } = require('./helpers')
const { CURRICULUM_BASE_URL } = require('./constants')

/**
 * Given a workout README and a path, creates a Workout object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Workout extends Content {
  constructor ({ body, path }) {
    super({ body, path })
    this.name = ''
    this.insights = []
    this.exercises = []
    this.game = null
    this.description = ''
    this.section = null
    this.type = ''

    this.parse(this.rawText)

    // not currently in use:
    this.course = null
    this.topic = null
    this.parent = null
  }

  /**
   * Take text of a Workout and return an object representing it
   * @param {string} Text of Workout file
   */
  parse (text) {
    yaml.safeLoadAll(text, doc => {
      for (const prop in doc) {
        this[prop] = doc[prop]
      }
    })
  }

  /**
   * Take text of an Exercise and return an object representing it
   * @param {string} Text of Exercise file
   */
  parseWorkout (text) {
    var exerciseArr = text.split('---')
    var data = yaml.safeLoad(exerciseArr.shift())

    data.exercises = exerciseArr.map(exercise => {
      return this.parseExercise(exercise)
    })
    for (let prop in data) {
      this[prop] = data[prop]
    }
  }

  addInsight (insight) {
    if (!insight) return
    // replaces the insight in the array of slugs
    if (insight.metadata.type === 'exercise') {
      let idx = this.exercises.indexOf(insight.slug)
      this.exercises[idx] = insight
      return
    }
    if (insight.metadata.type !== 'normal') {
      this.game = insight
      return
    }

    let idx = this.insights.indexOf(insight.slug)
    this.insights[idx] = insight
  }

  /**
   * Generates markdown based on current object properties
   * @returns {string} Markdown
   */
  render () {
    let markdown = ''

    // Name
    if (this.name != null) {
      markdown += `name: ${this.name}\n\n`
    }
    // Type
    markdown += `type: ${this.type || 'insights-list'}\n\n`
    // Description
    markdown += `description: ${this.description || 'todo'}\n\n`
    // Section
    if (this.section != null) {
      markdown += `section: ${this.section}\n\n`
    }

    // Insight List
    if (this.insights != null && this.insights.length > 0) {
      markdown += 'insights:\n'
      for (let i in this.insights) {
        markdown += ` - ${this.insights[i].slug}\n`
      }
      markdown += '\n'
    }

    // Append exercises
    if (this.exercises != null && this.exercises.length > 0) {
      for (let exercise of this.exercises) {
        markdown += '---\n## Exercise\n'
        if (
          typeof exercise['link-type'] != null &&
          typeof exercise['link'] != null
        ) {
          markdown += `${exercise['link-type']}-link: ${exercise['link']}\n`
        }
        if (typeof exercise['answer'] != null) {
          markdown += `answer: ${exercise.answer
            .toString()
            .replace(/\t/g, '\n\t')}\n`
        }
        if (typeof exercise.question != null) {
          markdown += `### Question\n${exercise.question}\n\n`
        }
      }
    }

    return markdown
  }

  getStats () {
    let stats = {
      practiceQuestions: 0,
      revisionQuestions: 0,
      quizQuestions: 0,
      stubs: 0,
      insights: 0,
      standards: 0
    }

    for (let insight of this.insights) {
      stats.insights++
      if (!insight.content || insight.stub) stats.stubs++
      if (
        !insight.type == 'normal' ||
        !insight.practiceQuestion ||
        !insight.revisionQuestion
      ) {
        continue
      }
      if (insight.practiceQuestion.text) {
        stats.practiceQuestions++
      }
      if (insight.revisionQuestion.text) {
        stats.revisionQuestions++
      }
    }

    if (stats.revisionQuestions > 1) {
      stats.placementTestReady = true
    }

    return stats
  }

  getExternalLink () {
    return `${CURRICULUM_BASE_URL}/tree/master/${this.topic}/${
      this.course
    }/${this.slug}/README.md`
  }

  setCourse (course) {
    this.course = course
  }

  setTopic (topic) {
    this.topic = topic
  }

  toJSON () {
    return removeEmptyObjectProperties({
      name: this.name,
      slug: this.slug,
      insights: this.insights,
      topic: this.topic,
      subtopic: this.subtopic,
      description: this.description,
      section: this.section,
      type: this.type,
      game: this.game,
      exercises: this.exercises
    })
  }
}
