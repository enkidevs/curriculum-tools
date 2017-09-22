const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const readline = require('readline');
const emoji = require('node-emoji');


const NEW_STRUCTURE = process.argv[2];
const TOPIC_PATH = process.argv[3];

const currentStructure = {};
const newStructure = {};
const toMove = {};
let totalInsights = 0;


// new structure
if(fs.existsSync(NEW_STRUCTURE)) {
  const doc = fs.readFileSync(NEW_STRUCTURE , 'utf8');
  const courseNames = [];
  doc.match(/Course\s?\d*:(.*)/g).forEach(courseName => {
    courseNames.push(courseName.replace(/Course\s?\d*:\s*/g, ''));
  });
  doc.split(/Course\s?\d*:.*/).slice(1).forEach((course, ind) => {
    newStructure[courseNames[ind]] = {
      order: parseNewCourse(removeTags(course)),
    };
  });
} else {
  console.log('The path to the new structure is invalid.');
  process.exit(0);
}

// existing structure
if(fs.existsSync(TOPIC_PATH)) {
  fs.readdirSync(TOPIC_PATH, 'utf8').filter(dir => !dir.match('README.md')).forEach(course => {
    // Each directory is either an old Subtopic or a new Course
    const allWorkouts = fs.readdirSync(path.join(TOPIC_PATH, course));
    // Get hardcoded workouts, which are directories instead of .md files
    const workouts = allWorkouts.filter(workout => !workout.match('.*\.md'));
    // Get not used insights and games
    const leftovers = allWorkouts.filter(insight => insight !== 'README.md' && insight.match('.*\.md'));

    let order = [];
    currentStructure[course] = {};

    // if the directory is now a course
    if(workouts.length > 0) {
      // Read course metadata
      const cMetadata = yaml.safeLoad(fs.readFileSync(path.join(TOPIC_PATH, course, 'README.md')));
      cMetadata.sections.forEach(section => order[section] = []);

      workouts.forEach(workoutSlug => {
        // reads workout metadata
        const cPath = path.join(TOPIC_PATH, course, workoutSlug);
        const wMetadata = yaml.safeLoad(fs.readFileSync(path.join(cPath, 'README.md')));
        order[wMetadata.section].push(Object.assign({}, wMetadata, {
          slug: workoutSlug,
        }));
      });

      // sort workouts to match their right order
      // should be done recursively
      order.forEach((section, ind) => {
        // find the first workout
        let rightOrder = [];
        for(let i = 0; i < section.length; ++i) {
          if(!section[i].parent) {
            rightOrder.push(section[i]);
            section.splice(i, 1);
            break;
          }
        }
        // reorder them
        while(section.length) {
          for(let i = 0; i < section.length; ++i) {
            if(section[i].parent === rightOrder[rightOrder.length - 1].slug) {
              rightOrder.push(section[i]);
              section.splice(i, 1);
              break;
            }
          }
        }
        order[ind] = rightOrder;
      });
    }

    // an old subtopic with no workouts, but more insights than just the README.md
    currentStructure[course].order = order;
    currentStructure[course].leftovers = leftovers;
  });
} else {
  console.log('The path to the topic is invalid');
  process.exit(0);
}

console.log(newStructure['Ecmascript 2015'].order[1]);


//     console.log(`Course ${courseTitle} not found.`);
//   } else {
//     newStructure[courseTitle].forEach(workout => {
//       if(!currentStructure[courseTitle][workout.]) {
//         console.log(`Workout "${workout.title}" (${.slug}) in ${courseTitle} not found.`);
//       } else {
//         if(currentStructure[courseTitle])
//       }
//     });
//   }
// });


function parseNewCourse(course) {
  // remove standards
  const workouts = course.replace(/Standards[:\s]*(\r\n|\r|\n)+----------((\r\n|\r|\n)+-\s+.*)*(----------)?/g, '');
  // parse new structure
  return workouts.replace(/`/g, '').split('\n').reduce((acc, line) => {
    // match section
    const section = line.match(/----------/);
    // match workout title
    const wTitle = line.match(/-\s+[wW]\d+:\s*(.*)/);
    // match insight
    const iTitle = line.match(/-\s*\w.*/) && !line.match(/-\s*[gG]ame:/);

    // add new section
    if(section) {
      acc.push([]);
      return acc;
      // add new workout
    } else if(wTitle) {
      const lastSection = acc[acc.length - 1];
      let workout = {
        name: wTitle[1].trim(),
        slug: slugify(wTitle[1].trim()),
        section: acc.length - 1,
        insights: [],
      };
      if(lastSection.length > 0) {
        workout.parent = lastSection[lastSection.length - 1].slug;
      }
      lastSection.push(workout);
      acc[acc.length - 1] = lastSection;
      // add new insight
    } else if(iTitle) {
      const lastSection = acc[acc.length - 1];
      lastSection[lastSection.length - 1].insights.push(line.replace(/-\s*/, '').trim());
      acc[acc.length - 1] = lastSection;
    }
    return acc;
  }, []);
}


function removeTags(course) {
  const emojiMatcher = new RegExp('[' + emoji.get('baby') +
    emoji.get('muscle') + emoji.get('sparkles') + emoji.get('octopus') +
    emoji.get('dragon') + '🦑' + ']', 'g');
  return course.replace(emojiMatcher, '');
}

// helper
function slugify(title) {
    return title
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'');
}
