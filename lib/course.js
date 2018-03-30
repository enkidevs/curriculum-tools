const yaml = require('js-yaml')
const pathModule = require('path')
const Content = require('./content')
const { removeEmptyObjectProperties } = require('./helpers')

const parseReferenceField = topicCourseSlug => {
  const [topicSlug, courseSlug] = topicCourseSlug.split(':')

  return {
    topicSlug,
    courseSlug
  }
}

/**
 * Given a course README string and a path, creates a nested Course object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */

module.exports = class Course extends Content {
  constructor ({ body, path }) {
    super({ body, path })
    this.topic = null
    this.workouts = []
    this.standards = []
    this.sections = {}

    this.parse(this.rawText)
  }

  /**
   * Recursively parses all child subtopics, workouts, and insights
   * @param {string} Course readme text
   */
  parse (text) {
    if (text.length === 0) throw new Error('Passed in empty readme text')
    let parsed = yaml.safeLoad(text)
    this.yamlProps = parsed
    this.description = parsed.description || ''
    // if (workout.section) this.sections[workout.section].push(workout);
    if (text.length === 0) {
      throw new Error('Passed empty course README')
    }
    yaml.safeLoadAll(text, doc => {
      for (const prop in doc) {
        this[prop] = doc[prop]
      }
    })

    if (this.next) {
      this.next = this.next.map(parseReferenceField)
    }

    if (this.prerequisites) {
      this.prerequisites = this.prerequisites.map(parseReferenceField)
    }
  }

  /**
   * Adds a Workout to its defined section
   * @param {Workout} Workout content object
   */
  addWorkout (workout) {
    if (!workout) {
      throw new Error('Passed undefined to addWorkout')
    }
    this.workouts.push(workout)
  }

  /**
   * Adds standard to Course
   * @param {string} standard
   */
  addStandard (standard) {
    this.standards.push(standard)
  }

  /**
   * Inserts workouts into their respective section and orders
   */
  sectionAndOrderWorkouts (orderedSections) {
    if (!orderedSections) orderedSections = this.sections
    // handy-dandy slug lookup table
    let workoutLookup = {}
    for (let w in this.workouts) {
      let workout = this.workouts[w]
      workoutLookup[workout.slug] = workout
    }

    // find each workout by slug, attach to it's section in order.
    let sections = {}
    for (let section in orderedSections) {
      sections[section] = []
      for (let slug of orderedSections[section]) {
        sections[section].push(workoutLookup[slug])
      }
    }

    this.sections = sections
  }

  getOrderedWorkouts () {
    if (!this.sections || Object.keys(this.sections).length <= 0) {
      throw new Error(`Empty section for course ${this.slug}`)
    }
    if (!this.workouts || this.workouts.length <= 0) {
      throw new Error(`No workouts within course ${this.slug}`)
    }

    const orderedWorkouts = []
    const workoutsSlugMap = new Map(
      this.workouts.map(workout => [workout.slug, workout])
    )
    const sectionsWorkoutSlugs = Object.values(this.sections).reduce((acc, val) => acc.concat(val), [])

    sectionsWorkoutSlugs.forEach(workoutSlug => orderedWorkouts.push(workoutsSlugMap.get(workoutSlug)))

    return orderedWorkouts
  }

  /**
   * Generates markdown based on current object properties
   * @returns {string} Markdown
   */
  render () {
    this.sectionAndOrderWorkouts(this.yamlProps.sections)
    // this should produce the text for the readme file that defines this course
    let sectionList = {}
    for (let sectionName in this.sections) {
      sectionList[sectionName] = this.sections[sectionName].map(w => {
        return w ? w.slug : 'undefined workout?'
      })
    }

    let output = {
      next: this.yamlProps.next || [],
      prerequisites: this.yamlProps.prerequisites || [],
      description: this.description,
      sections: sectionList
    }

    return yaml.safeDump(output)
  }

  /**
   * Gets Insights from course.
   * @param {function} Optional callback to filter insights array
   */
  getInsights (filter) {
    return this.workouts.reduce((files, workout) => {
      return filter
        ? files.concat(
          workout.insights
            .map(insight =>
              Object.assign({}, insight, { workoutName: workout.name })
            )
            .filter(insight => filter(insight))
        )
        : files.concat(
          workout.insights.map(insight =>
            Object.assign({}, insight, { workoutName: workout.name })
          )
        )
    }, [])
  }

  /**
   * Traverses the course in memory and returns a markdown-formatted string
   * @param {function} Optional: Callback to filter insights list
   * @returns {string} Markdown containing course title and table of Workout name | Insight slug (with link to location) | Status
   */
  renderCourse (filter) {
    const branch = this.git.getGitBranch()
    const markdown = this.getInsights(filter).reduce((md, insight) => {
      const link = this.git.getInsightURL(
        branch,
        insight.contentPath.split('curriculum/')[1]
      )

      return `${md}${insight.workoutName} | [${pathModule.basename(
        insight.contentPath
      )}](${link}) | ${insight.stub ? 'stub' : 'live'}\n`
    }, '')

    return markdown.length
      ? `\n# ${
        this.title
      }\n\nWorkout | Insight | Status\n--- | --- | ---\n${markdown}`
      : ''
  }

  readCourseTree (text, map = {}) {
    // rearranges the workouts and insights within the course
    // optionally, take in a hash map of keys and values formatted like so:
    // {
    //   ":functions:" "tags.functions"
    // }
    // that would look for the string ":functions:" next to the insight, and would add the tag "functions" to the "tags" field.
  }

  writeCourseTree () {
    // modifies the files to match the current structure in memory by traversing the course and moving files to their correct workouts
    // put removed insights into the .archived folder
    // add any metadata that doesn't currently
  }

  /**
   * Returns an object listing the contents of the Course
   * @returns {object} course contents
   */
  getStats () {
    let stats = {
      workouts: 0,
      insights: 0,
      practiceQuestions: 0,
      revisionQuestions: 0,
      quizQuestions: 0,
      standards: 0,
      stubs: 0,
      placementTestReady: true
    }

    for (let workout of this.workouts) {
      stats.workouts++
      let workoutStats = workout.getStats()

      stats.insights += workoutStats.insights
      stats.practiceQuestions += workoutStats.practiceQuestions
      stats.revisionQuestions += workoutStats.revisionQuestions
      stats.quizQuestions += workoutStats.quizQuestions
      stats.standards += workoutStats.standards
      stats.stubs += workoutStats.stubs
      if (!workoutStats.placementTestReady) {
        stats.placementTestReady = false
      }
    }
    return stats
  }

  /**
   * Sets new git networking methods
   * @param {object} `./networking/github.js` instance
   */
  setGit (git) {
    this.git = git
  }

  toJSON () {
    return removeEmptyObjectProperties({
      name: this.name,
      slug: this.slug,
      description: this.description,
      topic: this.topic,
      sections: this.sections,
      next: this.next,
      prerequisites: this.prerequisites,
      core: this.core
    })
  }
}
