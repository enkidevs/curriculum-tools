#! usr/bin/node

const Curriculum = require('../lib/curriculum');
const GitHub = require('../lib/networking/github');

const basePath = process.argv[2];

const git = new GitHub(basePath);
const curriculum = new Curriculum(git);
//let curriculumStats = curriculum.getStats();


for (let t in curriculum.topics) {
  let topic = curriculum.topics[t];
  if (topic.courses) {
    for (let c in topic.courses) {
      let course = topic.courses[c];
      course.writeFile()
    }
  }
}

// for (let topicString in curriculumStats) {
//   let topic = curriculumStats[topicString]
//     for (let key in topic) {
//     if (key=="courses" || !key) continue;
//     if (!topic[key].placementTestReady) {
//       let missing = (topic.workouts * 2) - topic.revisionQuestions;
//       console.log(`${key} is missing ${missing} Revision Questions`)
//     }
//   }
// }
