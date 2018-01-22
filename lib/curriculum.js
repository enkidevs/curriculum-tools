'use strict'
// utility for reading in the entire curriculum from a file path
const os = require('os')
const fs = require('fs')
const Topic = require('./topic')
const Course = require('./course')
const Workout = require('./workout')
const Insight = require('./insight')
const Standard = require('./standard')
const { getAllFilesRecursively } = require('./helpers')

module.exports = class Curriculum {
  constructor(git) {
    // TODO: error checking

    // TODO: Check to see if the repo exists in the file system. If yes, do not clone.
    this.git = git;
    git.cloneRepos();

    this.contentPath = git.getCurriculumPath();
    this.standardsPath = git.getStandardsPath();
    this.wikiPath = git.getWikiPath();
    this.topics = {};
    if (!this.contentPath || !this.standardsPath || !this.wikiPath) throw new Error("Need a file path to content, standards and wiki");
    this.read(this.contentPath, this.standardsPath);
  }

  read(content, standards) {

    console.info("read all the curriculum into memory");
    let contentDirectories = fs.readdirSync(this.contentPath).filter((entry) => {
      return fs.statSync(`${this.contentPath}/${entry}`).isDirectory() && entry[0] !== ".";
     });
    let standardsDirectories = fs.readdirSync(this.standardsPath).filter((entry) => {
      return fs.statSync(`${this.standardsPath}/${entry}`).isDirectory() && entry[0] !== ".";
    });

    contentDirectories.forEach((topicFolder) => {
      let topicPath = `${this.contentPath}/${topicFolder}`;
      let readMePath = `${topicPath}/README.md`;


      if(topicFolder === '.archived') {
        this.archived = getAllFilesRecursively(topicPath).reduce((archivedTopic, insightPath) => {
          const archivedTopicName = insightPath.split('.archived/')[1].split('/')[0];

          if(!archivedTopic[archivedTopicName]) archivedTopic[archivedTopicName] = [];

          const archivedInsight = new Insight(insightPath);
          archivedTopic[archivedTopicName].push(archivedInsight);
          return archivedTopic;
        }, {});
      }

      if (fs.existsSync(readMePath)) {
        let topic = new Topic(readMePath);
        this.topics[topicFolder.toLowerCase()] = topic;
        topic.setGit(this.git);

        // console.info("courses");
        fs.readdirSync(topicPath).filter((entry) => {
          return fs.statSync(`${topicPath}/${entry}`).isDirectory() && entry !== ".git";
        }).forEach((courseFolder) => {

          let coursePath = `${topicPath}/${courseFolder}`;
          let readMePath = `${coursePath}/README.md`;
          if (fs.existsSync(readMePath)) {

            let course = new Course(readMePath);
            topic.addCourse(course);

            // console.info("workouts");
            fs.readdirSync(coursePath).filter((entry) => {
              return fs.statSync(`${coursePath}/${entry}`).isDirectory() && entry !== ".git";
            }).forEach((workoutFolder) => {
              let workoutPath = `${coursePath}/${workoutFolder}`;
              let readMePath = `${workoutPath}/README.md`;
              // if a workout doesn't have a readme, it's not valid
              if (fs.existsSync(readMePath)) {

                let readme = fs.readFileSync(readMePath, {encoding: 'utf8'});
                if (readme.length > 0) {

                  // if the workout's readme is empty it's a stub
                  let workout = new Workout(readMePath);
                  course.addWorkout(workout);
                  // console.info("insights");
                  fs.readdirSync(workoutPath).filter((entry) => {
                    return entry !== "README.md";
                  }).forEach((insightFile) => {
                    let insightPath = `${workoutPath}/${insightFile}`;
                    let insight = new Insight(insightPath);
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
          let standard = new Standard(`${topicPath}/${courseFolder}/${standardsFile}`)
          topic.addStandard(standard);
          course.addStandard(standard);
        });
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


/**
 * Adds all archived Insights to their respective topics
 */
  distributeArchivedInsightsToTopics() {
    Object.keys(this.topics).forEach(topicName => this.topics[topicName].addArchivedInsights(this.archived[topicName]));
  }

/**
 * Outputs a markdown list of courses, their child workouts, and their child insights with hyperlinks
 * @returns {string} Markdown-formatted list
 */
  generateCurriculumTree(){
    let data = "";

    data += `# Enki Content\n`;

    for (let i in curriculum.topics) {
      let topic = curriculum.topics[i];
      data += `### [${toTitleCase(i)}](${remote + i})\n\n`;
      for (let j in topic.courses) {
        let course = topic.courses[j];
        data += `* [${toTitleCase(j)}](${remote + i + "/" + j})\n`;
        for (let k in course.workouts){
          let workout = course.workouts[k];
          data += `\t* [${workout.slug}](${remote + i + "/" + j + "/" + workout.slug})\n`;
        }

      }

    }
    return data;
  }
}
