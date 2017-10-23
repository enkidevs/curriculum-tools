#! usr/bin/node

let os = require('os');
let Curriculum = require('../lib/curriculum.js')

let [contentPath, standardsPath] = [process.argv[2], process.argv[3]];
if (!contentPath) contentPath = `${os.homedir()}/src/content`
if (!standardsPath) standardsPath = `${os.homedir()}/src/standards`


let curriculum = new Curriculum(contentPath, standardsPath);

let curriculumStats = curriculum.getStats();
console.log(curriculumStats)

console.log("Not placementTestReady")

for (let topicString in curriculumStats) {
  let topic = curriculumStats[topicString]
    for (let key in topic) {
    if (key=="courses" or !key) continue;
    if (!topic[key].placementTestReady) {
      let missing = (topic.workouts * 2) - topic.revisionQuestions;
      console.log(`${key} is missing ${missing} Revision Questions`)
    }
  }
}
