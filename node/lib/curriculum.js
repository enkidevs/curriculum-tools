'use strict'
// utility for reading in the entire curriculum from a file path
let os = require('os')
let fs = require('fs')
let Topic = require('./topic')
let Course = require('./course')
let Workout = require('./workout')
let Insight = require('./insight')

module.exports = class Curriculum {
  constructor(content, standards) {
    //todo error checking
    this.contentPath = content;
    this.standardsPath = standards;
    this.topics = {};
    if (!content || !standards) throw new Error("Need a file path to both content and standards");
    this.read(content, standards);
  }

  read(content, standards) {

    console.info("read all the curriculum into memory");
    let contentDirectories = fs.readdirSync(this.contentPath).filter((entry) => {
      return fs.statSync(`${this.contentPath}/${entry}`).isDirectory() && entry !== ".git";
     });
    let standardsDirectories = fs.readdirSync(this.standardsPath).filter((entry) => {
      return fs.statSync(`${this.standardsPath}/${entry}`).isDirectory() && entry !== ".git";
    });

    console.info("content");
      console.info("topics");
      contentDirectories.forEach((topicFolder) => {
        let topicPath = `${this.contentPath}/${topicFolder}`;
        let readMePath = `${topicPath}/README.md`;
        if (fs.existsSync(readMePath)) {
          let readme = fs.readFileSync(readMePath, {encoding: 'utf8'});
          let topic = new Topic(readme);

          topic.setContentPath(topicPath);
          this.topics[topicFolder.toLowerCase()] = topic;

          console.info("courses");
          fs.readdirSync(topicPath).filter((entry) => {
            return fs.statSync(`${topicPath}/${entry}`).isDirectory() && entry !== ".git";
          }).forEach((courseFolder) => {
            let coursePath = `${topicPath}/${courseFolder}`;
            let readMePath = `${coursePath}/README.md`;
            if (fs.existsSync(readMePath)) {

              let readme = fs.readFileSync(readMePath, {encoding: 'utf8'});

              if (readme.length > 0) {
                let course = new Course(readme);

                topic.courses[courseFolder.toLowerCase()] = course;
                course.setTitle(courseFolder);
                course.setContentPath(coursePath);

                console.info("workouts");
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
                      let workout = new Workout(readme);
                      workout.setContentPath(workoutPath);
                      console.info("insights");
                      fs.readdirSync(workoutPath).filter((entry) => {
                        return entry !== "README.md";
                      }).forEach((insightFile) => {
                        let insightPath = `${workoutPath}/${insightFile}`
                        let insight = new Insight(fs.readFileSync(insightPath));
                        insight.setContentPath(`${workoutPath}/${insightFile}`);

                        workout.addInsight(insight);
                      })


                      course.addWorkout(workout);
                    }
                  }
                })


                topic.addCourse(course);
              }
            }
          })
        }
      })
    // standards
    // parse the course's standards
    // standardsDirectories.forEach((topicFolder) => {
    //   // loop over folders, attach to topics
    //   let topicPath = `${this.contentPath}/${topicFolder}`;
    //   let topic = this.topics[topicFolder.toLowerCase()];
    //
    //
    //   //find the namespace
    //   let namespace = fs.readFileSync(`${topicPath}/README.md`, {encoding: 'utf8'})
    //                     .match(/(topic\-namespace:\s.+\n)/)[0]
    //                     .replace("topic-namespace: ", "")
    //                     .replace("\n", "")
    //                     .toLowerCase();
    //
    //   topic.setNamespace(topicNamespace);
    //
    //   //read the course
    //   fs.readdirSync(topicPath).filter((entry) => {
    //     return fs.statSync(`${topicPath}/${entry}`).isDirectory() && entry !== ".git";
    //   }).forEach((coursePath) => {
    //     fs.readdirSync(coursePath).filter((entry) => {
    //       return entry.endsWith(/\.md/);
    //     }).forEach((standardsFile) => {
    //       let standard = new Standard(fs.readFileSync(entry))
    //       topic.addStandard(standard);
    //     });
    //   })
    //   console.log(topicNamespace);
    // })
  }
}
