let ContentWriter = require('./contentWriter');
let yaml = require('js-yaml');
let path = require('path');

/**
 * Given a course path, creates a nested Course object
 * @param {string} filepath
 * @class
 * @extends ContentWriter
 */
module.exports = class Course extends ContentWriter {
  constructor (path) {
    super(path)

    this.topic = null;
    this.workouts = [];
    this.standards = [];
    this.sections = {};
    try {
      this.parse(this.rawText);
    } catch(err) {
      console.error(`Problem with ${this.contentPath}`)
    }
  }

/**
 * Recursively parses all child subtopics, workouts, and insights
 * @param {string} Course readme text
 */
  parse(text) {
    if (text.length == 0) throw new Error("Passed in empty readme text");
    let parsed = yaml.safeLoad(text);
    if (parsed.sections) {
      parsed.sections.forEach((s) => {this.sections[s] = []});
      if (parsed.sections.workouts) parsed.sections.forEach((s) => {s.workouts.forEach((w) => {this.sections[s].push(w)})})
    }
    this.description = parsed.description || "";
  }

/**
 * Adds a Workout to its defined section
 * @param {Workout} Workout content object
 */
  addWorkout(workout) {
    if (!workout) throw new Error("Passed undefined to addWorkout");
    this.workouts.push(workout);
    if (workout.section) this.sections[workout.section].push(workout);
  }

/**
 * Adds standard to Course
 * @param {string} standard
 */
  addStandard(standard) {
    this.standards.push(standard);
  }

/**
 * Inserts workouts into their respective section and orders
 */
  sectionAndOrderWorkouts() {
    let sections = {};
    //put workouts in sections
    for (let w in this.workouts) {
      let workout = this.workouts[w];
      if(sections[workout.section]) {
        sections[workout.section][workout.slug] = workout;
      } else {
        sections[workout.section] = { [workout.slug] : workout}
      }
    }

    // loop through each workout and attach parents to children
    for (let s in sections) {
      let section = sections[s];
      for (let w in section) {
        let workout = section[w];
        if (!workout.parent) {
          // make sure we didn't find a parent before already
          if (!this.sections[workout.section].head) {
            this.sections[workout.section].head = workout;
            this.sections[workout.section].detachedHeads = [];
          } else {
            this.sections[workout.section].detachedHeads.push(workout)
          }
        } else {
          let parent = workout.parent;
          if (typeof parent == "string") {
            parent = this.workouts.find((w) => {return w.slug === workout.parent});
          }
          if (parent == undefined) {
            console.error("Missing parent: ", workout.title);
            continue;
          }
          workout.parent = parent;
          workout.parent.child = workout;
        }
      }
    }

    //order them as they would be in a linked list
    for (let section in this.sections) {
      let node = this.sections[section].head;
      sections[section] = [];
      while (node) {
        sections[section].push(node);
        node = node.child;
      }
      //append detached heads and any children naievely
      while (this.sections[section].detachedHeads.length > 0) {
        let node = this.sections[section].detachedHeads.shift();
        while (node) {
          sections[section].push(node);
          node = node.child;
        }
      }
    }

    this.sections = sections;
    // Assign the workout with no parent as this.sections[i].head
    // traverse the linked-list and put all the workouts in order in this.sections[i].workouts
  }


/**
 * Generates markdown based on current object properties
 * @returns {string} Markdown
 */
  render() {
    this.sectionAndOrderWorkouts()
    // this should produce the text for the readme file that defines this course
    let sectionList = {};
    Object.keys(this.sections).forEach((section) => {
      sectionList[section] = this.sections[section].map((w) => {return w.slug})
    })
    let output = {
      description: this.description,
      sections: sectionList
    }

    return yaml.safeDump(output)
  }

/**
 * Gets Insights from course.
 * @param {function} Optional callback to filter insights array
 */
  getInsights(filter) {
    return this.workouts.reduce((files, workout) => {
      return filter ?
        files.concat(workout.insights
          .map(insight => Object.assign({}, insight, {workoutName: workout.name}))
          .filter(insight => filter(insight))
        )
        : files.concat(workout.insights
          .map(insight => Object.assign({}, insight, {workoutName: workout.name}))
        );
    }, []);
  }


/**
 * Traverses the course in memory and returns a markdown-formatted string
 * @param {function} Optional: Callback to filter insights list
 * @returns {string} Markdown containing course title and table of Workout name | Insight slug (with link to location) | Status
 */
  renderCourse(filter) {
    const branch = this.git.getGitBranch();
    const markdown = this.getInsights(filter).reduce((md, insight) => {
      const link = this.git.getInsightURL(branch, insight.contentPath.split('curriculum/')[1]);
      return md + `${insight.workoutName} | [${path.basename(insight.contentPath)}](${link}) | ${insight.stub ? 'stub' : 'live'}\n`;
    }, '');

    return markdown.length ?
      `\n# ${this.title}\n\nWorkout | Insight | Status\n--- | --- | ---\n${markdown}`
      : '';

  }

  readCourseTree(text, map={}) {
    // rearranges the workouts and insights within the course
    // optionally, take in a hash map of keys and values formatted like so:
    // {
    //   ":functions:" "tags.functions"
    // }
    // that would look for the string ":functions:" next to the insight, and would add the tag "functions" to the "tags" field.
  }

  writeCourseTree() {
    // modifies the files to match the current structure in memory by traversing the course and moving files to their correct workouts
    // put removed insights into the .archived folder
    // add any metadata that doesn't currently
  }

/**
 * Returns an object listing the contents of the Course
 * @returns {object} course contents
 */
  getStats() {
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
      stats.workouts++;
      let workoutStats = workout.getStats();

      stats.insights += workoutStats.insights;
      stats.practiceQuestions += workoutStats.practiceQuestions;
      stats.revisionQuestions += workoutStats.revisionQuestions;
      stats.quizQuestions += workoutStats.quizQuestions;
      stats.standards += workoutStats.standards;
      stats.stubs += workoutStats.stubs;
      if (!workoutStats.placementTestReady) stats.placementTestReady = false;
    }
    return stats;
  }

/**
 * Sets new git networking methods
 * @param {object} `./networking/github.js` instance
 */
  setGit(git) {
    this.git = git;
  }

  producePlacementTest(sections) {



  }

}
