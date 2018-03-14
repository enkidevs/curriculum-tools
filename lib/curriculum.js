'use strict'
// utility for reading in the entire curriculum from a file path
const os = require('os')
const fs = require('fs')
const nodePath = require('path')
const Topic = require('./topic')
const Course = require('./course')
const Workout = require('./workout')
const Insight = require('./insight')
const Standard = require('./standard')
const vfile = require('to-vfile');
const { getAllFilesRecursively, toTitleCase, slugify } = require('./helpers')
const {CURRICULUM_BASE_URL} = require('./constants.js')



module.exports = class Curriculum {
  constructor(git) {
    // TODO: error checking
    this.git = git;
    git.cloneRepos();

    this.contentPath = git.getCurriculumPath();
    this.standardsPath = git.getStandardsPath();
    this.wikiPath = git.getWikiPath();
    this.topics = {};
    if (!this.contentPath || !this.standardsPath || !this.wikiPath) throw new Error("Need a file path to content, standards and wiki");
    this.read(this.contentPath, this.standardsPath);
    this.newCourses = [];
  }

  /**
   * Reads all curriculum into memory, and associates it, from files
   * @param {filePath} content 
   * @param {filePath} standards 
   */
  read(content, standards) {
    let contentDirectories = fs.readdirSync(this.contentPath).filter((entry) => {
      return fs.statSync(`${this.contentPath}/${entry}`).isDirectory() && entry[0] !== ".";
     });
    let standardsDirectories = fs.readdirSync(this.standardsPath).filter((entry) => {
      return fs.statSync(`${this.standardsPath}/${entry}`).isDirectory() && entry[0] !== ".";
    });

    // First, loop over all the top-level directories
    // These directories are Topics.
    contentDirectories.forEach((topicFolder) => {
      let topicPath = `${this.contentPath}/${topicFolder}`;
      let readMePath = `${topicPath}/README.md`;

      // treat the .archived folder differently
      if(topicFolder === '.archived') {
        this.archived = getAllFilesRecursively(topicPath).reduce((archivedTopic, insightPath) => {
          const archivedTopicName = insightPath.split('.archived/')[1].split('/')[0];

          if(!archivedTopic[archivedTopicName]) archivedTopic[archivedTopicName] = [];

          const archivedInsight = new Insight({ body: vfile.readSync(insightPath, 'utf8'), path: insightPath});
          archivedTopic[archivedTopicName].push(archivedInsight);
          return archivedTopic;
        }, {});
      }

      if (fs.existsSync(readMePath)) {
        const body = vfile.readSync(readMePath, 'utf8');
        let topic;
        try {
          topic = new Topic({body, 'path': readMePath});

        } catch (e) {
          console.error(e)
          console.error(`Problem with: ${readMePath}`)
        }
        this.topics[topicFolder.toLowerCase()] = topic;
        topic.setGit(this.git);

        // Now loop over all the subtopics / courses within this topic, read them,
        // and associate them to the topic
        fs.readdirSync(topicPath).filter((entry) => {
          return fs.statSync(`${topicPath}/${entry}`).isDirectory() && entry !== ".git";
        }).forEach((courseFolder) => {

          let coursePath = `${topicPath}/${courseFolder}`;
          let readMePath = `${coursePath}/README.md`;
          if (fs.existsSync(readMePath)) {

            const body = vfile.readSync(readMePath, 'utf8');
            let course;
            try {
              course = new Course({body, 'path': readMePath});
            } catch (e) {
              console.log(`Problem with: ${readMePath}`)
            }
            topic.addCourse(course);

            // now find all the workouts from this subtopic / course
            // and associate them to the course
            fs.readdirSync(coursePath).filter((entry) => {
              return fs.statSync(`${coursePath}/${entry}`).isDirectory() && entry !== ".git";
            }).forEach((workoutFolder) => {
              let workoutPath = `${coursePath}/${workoutFolder}`;
              let readMePath = `${workoutPath}/README.md`;
              // if a workout doesn't have a readme, it's not valid
              if (fs.existsSync(readMePath)) {

                const body = vfile.readSync(readMePath, 'utf8').contents;
                if (body.length > 0) {

                  // if the workout's readme is empty it's a stub
                  let workout;
                  try {
                    workout = new Workout({body, path: readMePath});
                  } catch (e) {
                    console.log(`Problem with: ${readMePath}`)
                  }
                  course.addWorkout(workout);
                  // Now add all the elements within the workout folder
                  // this comprises Insights, Games, and Exercises
                  // they're similarly parsed, so they use the same parser
                  fs.readdirSync(workoutPath).filter((entry) => {
                    return entry !== "README.md";
                  }).forEach((insightFile) => {
                    let insightPath = `${workoutPath}/${insightFile}`;
                    const body = vfile.readSync(insightPath, 'utf8');
                    let insight;
                    try {
                      insight = new Insight({body, 'path': insightPath});
                    } catch (e) {
                      console.log(`Problem with: ${insightPath}`)
                    }
                    workout.addInsight(insight);
                  })
                }
              }
            })
          }
        })

      }
    })


    // standards
    // parse the course's standards
    standardsDirectories.forEach((topicFolder) => {
      // loop over folders, attach to topics
      let topicPath = `${this.standardsPath}/${topicFolder}`;
      let topic = this.topics[topicFolder.toLowerCase()];
      if (!topic) return

      //read the course
      fs.readdirSync(topicPath).filter((entry) => {
        return fs.statSync(`${topicPath}/${entry}`).isDirectory() && entry !== ".git";
      }).forEach((courseFolder) => {
        let course = topic.courses[courseFolder.toLowerCase()];
        if (!course) return
        fs.readdirSync(`${topicPath}/${courseFolder}`).filter((entry) => {
          return entry.match(/.+\.md/);
        }).forEach((standardsFile) => {
          let readMePath = `${topicPath}/${courseFolder}/${standardsFile}`
          const body = vfile.readSync(readMePath, 'utf8');
          let standard = new Standard({body, 'path': `${topicPath}/${courseFolder}/${standardsFile}`})
          topic.addStandard(standard);
          course.addStandard(standard);
        })
      })
    })
  }

/**
 * Recursively gets statistics on each course.
 * @param {boolean} verbose
 * @returns {object} Global statistics
 */
  getStats(verbose) {
    let stats = {};
    for (let key in this.topics) {
      if (!key) continue;
      let topicStats = this.topics[key].getStats(verbose);
      if (!verbose && topicStats.courses == 0) continue;
      stats[key] = topicStats;
    }
    return stats;
  }

  findElementBySlug(element, slug) {
    let [topic, course, workoutSlug, insightSlug] = slug.split(":")
    switch (element) {
      case "topic":
        return this.topics[slug];
        break;
      case "course":
        return this.topics[topic].courses[course]
        break;
      case "workout":
        return this.topics[topic].courses[course].workouts.find(workout => workout.slug == workoutSlug)
        break;
      case "exercise":
        let workout = this.topics[topic].courses[course].workouts.find(workout => workout.slug == workoutSlug)
        let exerciseNumber = insightSlug
        return workout.exercises[exerciseNumber]
        break;
      case "revision":
        let workoutRevision = this.topics[topic].courses[course].workouts.find(workout => workout.slug == workoutSlug)
        let insightRevision = workoutRevision.insights.find(insight => insight.slug == insightSlug)
        return insightRevision.revisionQuestion
        break;
      case "practice":
        let workoutPractice = this.topics[topic].courses[course].workouts.find(workout => workout.slug == workoutSlug)
        let insightPractice = workoutPractice.insights.find(insight => insight.slug == insightSlug)
        return insightPractice.practiceQuestion
        break;
      case "quiz":
        let workoutQuiz = this.topics[topic].courses[course].workouts.find(workout => workout.slug == workoutSlug)
        let insightQuiz = workoutQuiz.insights.find(insight => insight.slug == insightSlug)
        return insightQuiz.quizQuestion
        break;
      default:
        return this;
  }
}
/**
 * Adds all archived Insights to their respective topics
 */
  distributeArchivedInsightsToTopics() {
    Object.keys(this.topics).forEach(topicName => this.topics[topicName].addArchivedInsights(this.archived[topicName]));
  }

/**
 * Generate course-map with clickable links
 * @returns {string} Markdown list
 */
  generateCurriculumTreeMarkdown() {
    let curriculum = this;

    let remote = `${CURRICULUM_BASE_URL}/tree/master/`;
    let data = "";
    data += `# Enki Content\n`;

    for (let topicName in curriculum.topics) {
      let topic = curriculum.topics[topicName];
      data += `### [${toTitleCase(topicName)}](${remote + topicName})\n\n`;

      // Create bullet list of courses
      for (let courseName in topic.courses) {
        let course = topic.courses[courseName];
        data += `* [${toTitleCase(courseName)}](${remote + topicName + "/" + courseName})\n`;

        // Create tabbed bullet list of workouts
        for (let workoutName in course.workouts){
          let workout = course.workouts[workoutName];
          data += `\t* [${workout.slug}](${remote + topicName + "/" + courseName + "/" + workout.slug})\n`;
        }
      }
    }
    return data;
  }
  renderTopicsTable() {
    let data = "";
    // Hard-coded header and table layout.
    data += `These are the topics that currently exist, with planning and discussion boards for each.\n
<!-- AUTOGENERATED TABLE: LIST_OF_TOPICS -->
Topic | Subtopics | Workouts | Insights | PQ | RQ | Standards | Assessments | Stubs
--- | --- | --- | --- | --- | --- | --- | --- | ---
`;

    // Parse topic obj into table row
    for (let topic in this.topics) {
      data += this.topics[topic].renderTopicStatsRow()
    }
    data += "<!-- END AUTOGENERATED TABLE: LIST_OF_TOPICS -->\n\n\n";
    // return header + table
    return data;
  }

  readCourseFile({topic, path}) {
    let content = vfile.readSync(path, 'utf8');
    // add --- separators if missing
    content = content.replace(/(---\n)?## ?[Pp]ractice/g, '---\n## Practice')
      .replace(/(---\n)?## ?[Rr]evision/g, '---\n## Revision')
      .replace(/(---\n)?## ?[Qq]uiz/g, '---\n## Quiz');
    const course = new Course({});

    // isolate course name and description from the file
    const courseName = content.substring(0, content.indexOf('\n')).trim();
    const courseDescription = content.substring(0, content.indexOf('#')).match(/description:(.*)/)[1].trim();

    course.name = courseName;
    course.slug = slugify(courseName);
    course.description = courseDescription;

    // Right now, I'm adding everything to section 0.
    // The question here is what is the minimum metadata to be included in the
    // course file and where to insert it
    const topicSlug = slugify(topic);
    let lastSection = 0;
    if(this.topics[topicSlug].courses[course.slug]) {
      lastSection = Object.keys(this.topics[topicSlug].courses[course.slug].sections).length - 1;
    }

    course.topic = topicSlug;
    course.sections[lastSection] = [];

    content.split(/^###/m).slice(1).forEach(rawWorkout => {
      const workout = new Workout({});
      const workoutName = rawWorkout.substring(0, rawWorkout.indexOf('\n')).trim();
      const metadata = rawWorkout.substring(rawWorkout.indexOf('\n') + 1, rawWorkout.indexOf('#') - 1);


      workout.name = workoutName;
      workout.slug = slugify(workoutName);
      workout.course = course.slug;
      workout.section = lastSection;

      rawWorkout.split(/^#[^#]/m).slice(1).forEach(rawInsight => {
        const insightTitle = rawInsight.substring(0, rawInsight.indexOf('\n')).trim();
        // Build the insight string from existing data
        const insightString = '# ' + insightTitle + '\n' + metadata +
          '---\n## Content\n\n' + rawInsight.substring(rawInsight.indexOf('\n') + 1);
          // console.log('************INSIGHT STRING***********', insightString);
        const insight = new Insight({body: insightString});
        insight.name = insightTitle;
        insight.slug = slugify(insightTitle);

        workout.insights.push(insight);
      });
      course.sections[lastSection].push(workout.slug);
      course.workouts.push(workout);
    });
    // If the course exists, just add new workouts
    if(this.topics[topicSlug].courses[course.slug]) {
      this.topics[topicSlug].courses[course.slug].workouts.concat(course.workouts);
      this.topics[topicSlug].courses[course.slug].sections[lastSection].concat(course.workouts);
    } else {
      this.topics[topicSlug].courses[course.slug] = course;
    }
    /** Reasoning for having a newCourses array
          - Right now, there's no other way of adding new content in bulk
          - Avoid having to go through all curriculum
    **/
    this.newCourses.push(course);
  }
  getAllInsights() {
    //loop over all insights in the curriculum. Useful for stats, scripted changes to all insights.
    let insights = [];
    for (let t in this.topics) {
      let topic = this.topics[t]
      for (let c in topic.courses) {
        let course = topic.courses[c]
        for (let workout of course.workouts) {
          for (let insight of workout.insights) {
            insights.push(insight)
          }
        }
      }
    }
    return insights;
  }
  getAllWorkouts() {
    //loop over all insights in the curriculum. Useful for stats, scripted changes to all insights.
    let workouts = [];
    for (let t in this.topics) {
      let topic = this.topics[t]
      for (let c in topic.courses) {
        let course = topic.courses[c]
        for (let workout of course.workouts) {
          workouts.push(workout)
        }
      }
    }
    return workouts;
  }
  getAllCourses() {
    //loop over all insights in the curriculum. Useful for stats, scripted changes to all insights.
    let courses = [];
    for (let t in this.topics) {
      let topic = this.topics[t]
      for (let c in topic.courses) {
        let course = topic.courses[c]
        courses.push(course)
      }
    }
    return courses;
  }
}
