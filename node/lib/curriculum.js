'use strict'
// utility for reading in the entire curriculum from a file path
import os;
import fs;
import Course from './course';
import Workout from './workout';
import Insight from './insight';

export default class Curriculum() {
  constructor(content, standards) {
    //todo error checking
    this.contentPath = content;
    this.standardsPath = standards;
    this.topics = {};
    if (!content || !standards) throw new Error("Need a file path to both content and standards");
  }

  read(content, standards) {
    // read all the files
    let contentDirectories = fs.readdirSync(cwd).filter((entry) => {
      return fs.statSync(`${this.contentPath}/${entry}`).isDirectory() && entry !== ".git";
     });
    let standardsDirectories = fs.readdirSync(cwd).filter((entry) => {
      return fs.statSync(`${this.standardsPath}/${entry}`).isDirectory() && entry !== ".git";
    });

    // content
      // topics
      contentDirectories.forEach((topicFolder) => {
        let topicPath = `${this.contentPath}/${topicPath}`;
        let readMePath = `${topicPath}/README.md`;
        if (fs.existsSync(readMePath)) {
          let readme = fs.readFileSync(readMePath, {encoding: 'utf8'});
          let topic = new Topic(readme);

          topic.setContentPath(topicPath);
          this.topics[topicFolder.toLowerCase()] = topic;

          // courses
          fs.readdirSync(topicPath).filter((entry) => {
            return fs.statSync(`${topicPath}/${entry}`).isDirectory() && entry !== ".git";
          }).forEach((courseFolder) => {
            let coursePath = `${topicPath}/${courseFolder}`;
            let readMePath = `${coursePath}/README.md`;
            let readme = fs.readFileSync(readMePath, {encoding: 'utf8'});
            let course = new Course(readme);
            
            topic.courses[courseFolder.toLowerCase()] = course;
            course.setTitle(courseFolder);
            course.setContentPath(courseFolder);

            // workouts
            fs.readdirSync(coursePath).filter((entry) => {
              return fs.statSync(`${coursePath}/${entry}`).isDirectory() && entry !== ".git";
            }).forEach((workoutFolder) => {
              let workoutPath = `${coursePath}/${workoutFolder}`;
              let readMePath = `${workoutPath}/README.md`;
              let readme = fs.readFileSync(readMePath, {encoding: 'utf8'});
              let workout = new Workout(readme);
              workout.setContentPath(workout);
              // insights
              fs.readdirSync(workoutPath).filter((entry) => {
                return entry !== "README.md";
              }).forEach((insight) => {

                let insight = new Insight(fs.readFileSync(`${workoutPath}/${entry}`));
                insight.setContentPath(`${workoutPath}/${entry}`);

                workout.addInsight(insight);
              })


              course.addWorkout(workout);
            })


            topic.addCourse(course);
          })
        }
      })
    // standards
    // parse the course's standards
    standardsDirectories.forEach((topicFolder) => {
      // loop over folders, attach to topics
      let topicPath = `${this.contentPath}/${topicFolder}`;
      let topic = this.topics[topicFolder.toLowerCase()];


      //find the namespace
      let namespace = fs.readFileSync(`${topicPath}/README.md`, {encoding: 'utf8'})
                        .match(/(topic\-namespace:\s.+\n)/)[0]
                        .replace("topic-namespace: ", "")
                        .replace("\n", "")
                        .toLowerCase();

      topic.setNamespace(topicNamespace);

      //read the course
      fs.readdirSync(topicPath).filter((entry) => {
        return fs.statSync(`${topicPath}/${entry}`).isDirectory() && entry !== ".git";
      }).forEach((coursePath) => {
        fs.readdirSync(coursePath).filter((entry) => {
          return entry.endsWith(/\.md/);
        }).forEach((standardsFile) => {
          let standard = new Standard(fs.readFileSync(entry))
        });
      })
      console.log(topicNamespace);
    })
      // loop over subfolders, those are courses
      // loop over each standard file and create it
  }
}
