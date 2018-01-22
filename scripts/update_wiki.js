#! usr/bin/env node

const Curriculum = require('../lib/curriculum');
const GitHub = require('../lib/networking/github');

const basePath = process.argv[2];

const remote = "https://github.com/enkidevs/curriculum/tree/master/";

const git = new GitHub(basePath);
const curriculum = new Curriculum(git);
const fs = require('fs');
const path = require('path');
let curriculumStats = curriculum.getStats();


/**
 * For each topic, generate a page like this: https://github.com/enkidevs/curriculum/wiki/JavaScript-Topic
 */
function writeCoursePages() {
  for (let i in curriculum.topics) {
    let data = "";

    data += `- [Content Folder](${remote}${i})
- [Standards](${remote}${i})

## Live Courses
`;
    let topic = curriculum.topics[i];
    for (j in topic.courses) {
      data+=`- [${ toTitleCase(j) }](${remote}${i}/${j})\n`;
    }
    fs.writeFileSync(path.join(basePath, `curriculum.wiki/${toTitleCase(i)}-Topic.md`), data);

  }
  console.log("Course information generated.");
}


/**
 * Updates LOT in local directory.. https://github.com/enkidevs/curriculum/wiki/List-of-Topics
 *
 */
function updateTopicsTable() {
  let data = "";

  // Hard-coded header and table layout.
  data += `These are the topics that currently exist, with planning and discussion boards for each.\n
Topic | Subtopics | Workouts | Insights | PQ | RQ | Standards | Assessments | Stubs
--- | --- | --- | --- | --- | --- | --- | --- | ---
`;

  // Parse topic obj into table row
  for (let i in curriculumStats) {
    let topic = curriculumStats[i];
    data += `[[${toTitleCase(i)} Topic]] | ${topic.courses} | ${topic.workouts} | ${topic.insights} | ${topic.practiceQuestions} | ${topic.revisionQuestions} | ${topic.standards} | ${topic.assessments || 0} | ${topic.stubs}\n`;
  }

  // return header + table
  return data;
}


/**
 * Generate course-map with clickable links
 */
function generateCourseTree() {
  let data = "";

  data += `# Enki Content\n`;

  for (let i in curriculum.topics) {
    let topic = curriculum.topics[i];
    data += `### [${toTitleCase(i)}](${remote + i})\n\n`;
    for (let j in topic.courses) {
      let course = topic.courses[j];
      // console.log(course);
      // console.log(j)
      data += `* [${toTitleCase(j)}](${remote + i + "/" + j})\n`;
      for (let k in course.workouts){
        let workout = course.workouts[k];
        data += `\t* [${workout.slug}](${remote + i + "/" + j + "/" + workout.slug})\n`;
        // console.log(workout.slug);
      }

    }
  }

  // TODO: Write relevant file in `curriculum.wiki`
  console.log(data);
}


// generateCourseTree();
// writeCoursePages();
// updateTopicsTable();
