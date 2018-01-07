let ContentWriter = require('./contentWriter');
let yaml = require('js-yaml');
let path = require('path');

module.exports = class Course extends ContentWriter {
  constructor (path) {
    super(path)

    this.topic = null;
    this.workouts = [];
    this.standards = [];
    this.sections = {};
    this.parse(this.rawText);
  }

  parse(text) {
    if (text.length == 0) throw new Error("Passed in empty readme text");
    let parsed = yaml.safeLoad(text);
    if (parsed.sections) {
      parsed.sections.forEach((s) => {this.sections[s] = []});
      if (parsed.sections.workouts) parsed.sections.forEach((s) => {s.workouts.forEach((w) => {this.sections[s].push(w)})})
    }
    this.description = parsed.description || "";
  }

  addWorkout(workout) {
    if (!workout) throw new Error("Passed undefined to addWorkout");
    this.workouts.push(workout);
    if (workout.section) this.sections[workout.section].push(workout);
  }

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
          if (parent == undefined) throw new Error("Missing parent: ", parent)
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

  // Traverses the course in memory and returns as a markdown-formatted string:
  //  The course title as an H1
  //  table containing: Workout name | Insight slug (with link to location) | Status
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

  setGit(git) {
    this.git = git;
  }
  producePlacementTest(sections) {



  }

}
