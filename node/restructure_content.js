const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const readline = require('readline');
const emoji = require('node-emoji');


const NEW_STRUCTURE = process.argv[2];
const TOPIC_PATH = process.argv[3];

const currentStructure = {};
const newStructure = {};
const currentSlugToPath = {};
const toMove = {};


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
    const leftovers = allWorkouts.filter(insight => insight !== 'README.md' && insight.match('.*\.md'))
      .map(insight => insight.replace('.md', ''));

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


// map the current structure to an easy insight slug - relative path object
// this should actually be the main object
Object.keys(currentStructure).forEach(course => {
  // get current courses paths
  if(currentStructure[course].order.length) {
    currentStructure[course].order.forEach(section => {
      section.forEach(workout => {
        workout.insights.forEach(insightSlug => {
          currentSlugToPath[insightSlug] = path.join(course, workout.slug, insightSlug);
        });
      });
    });
    // insights not in use
  }
  if(currentStructure[course].leftovers.length){
    currentStructure[course].leftovers.forEach(insightSlug => {
      currentSlugToPath[insightSlug] = path.join(course, insightSlug);
    });
  }

});

// console.log(currentStructure['Npm'].order[1][1].insights);


Object.keys(newStructure).forEach(courseName => {
  if(!currentStructure[courseName]) {
    console.log(`Course ${courseName} not found in the current structure.`);
  } else {
    const newCourseLen = newStructure[courseName].order.length;
    const oldCourseLen = currentStructure[courseName].order.length;
    // log if there's a difference in the course's number of sections
    if(newCourseLen !== oldCourseLen) {
      console.log(`The new structure of ${courseName} has
        ${newCourseLen > oldCourseLen ? 'more' : 'less'} sections.`);
    }
    newStructure[courseName].order.forEach(section => {
      section.forEach((workout, ind) => {
        workout.insights.forEach(insight => {
          if(path.join(courseName, workout.slug, insight) !== currentSlugToPath[insight]) {
            console.log(`Insight ${insight} is currently in ${currentSlugToPath[insight]}
    instead of ${path.join(courseName, workout.slug, insight)}`);
          }
        });
      });
    });
  }
});



function parseNewCourse(course) {
  // remove standards
  const workouts = course.replace(/Standards[:\s]*(\r\n|\r|\n)+----------((\r\n|\r|\n)+-\s+.*)*(----------)?/g, '');
  // parse new structure
  return workouts.replace(/`/g, '').split('\n').reduce((acc, line) => {
    // match section
    const section = line.match(/----------/);
    // match workout title
    const wTitle = line.match(/-\s+[wW]\d+:\s*([\w,\s]*)\[(.*)\]/);

    // match insight
    const iTitle = line.match(/-\s(([a-z0-9]+-*)+)/);

    // add new section
    if(section) {
      acc.push([]);
      return acc;
      // add new workout
    } else if(wTitle) {
      const lastSection = acc[acc.length - 1];
      let workout = {
        name: wTitle[1].trim(),
        slug: wTitle[2].trim(),
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
      lastSection[lastSection.length - 1].insights.push(iTitle[1].trim());
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
