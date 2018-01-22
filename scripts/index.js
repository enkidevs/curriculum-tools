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


// for (let t in curriculum.topics) {
//   let topic = curriculum.topics[t];
//   if (topic.courses) {
//     for (let c in topic.courses) {
//       let course = topic.courses[c];
//       course.writeFile()
//     }
//   }
// }

/**
 * Writes Course pages for wiki in `curriculum.wiki` local directory
 *
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
      data+=`- [${ toTitleCase( j.replace(/\-/g," ") ) }](${remote}${i}/${j})\n`;
    }
    fs.writeFileSync(path.join(basePath, `curriculum.wiki/${toTitleCase(i)}-Topic.md`), data);
  }

}
