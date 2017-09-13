const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const readline = require('readline');
const emoji = require('node-emoji');


const NEW_STRUCTURE = process.argv[2];
const TOPIC_PATH = process.argv[3];

const currentStructure = {};
const newStructure = {};
let totalInsights = 0;


if(fs.existsSync(NEW_STRUCTURE)) {
  const doc = fs.readFileSync(NEW_STRUCTURE, 'utf8');
  const courseNames = [];
  doc.match(/Course\s?\d*:(.*)/g).forEach(courseName => {
    courseNames.push(courseName.replace(/Course\s?\d*:\s*/g, ''));
  });
  doc.split(/Course\s?\d*:.*/).slice(1).forEach((course, ind) => {
    newStructure[courseNames[ind]] = parseCourse(removeTags(course));
  });
} else {
  console.log('The path to the new structure is invalid.');
  process.exit(0);
}


if(fs.existsSync(TOPIC_PATH)) {
  fs.readdirSync(TOPIC_PATH, 'utf8').filter(dir => !dir.match('README.md')).forEach(dir => {
    const courses = fs.readdirSync(path.join(TOPIC_PATH, dir)).filter(workout => !workout.match('README.md'));
    if(courses[0] && fs.lstatSync(path.join(TOPIC_PATH, dir, courses[0])).isDirectory()) {
      currentStructure[dir] = {};
      courses.forEach(course => {
        const cPath = path.join(TOPIC_PATH, dir, course);
        const insights = fs.readdirSync(cPath).filter(slug => !slug.match('README.md'))
          .map(slug => ({
            slug: slug.trim(),
            title: fs.readFileSync(path.join(cPath, slug), 'utf8').split('\n')[0].substring(1)
              .replace(/[`*_]/g, '').trim(),
          }));
        totalInsights += insights.length;
        currentStructure[dir][course] = insights;
      });
    } else if (courses[0] && fs.lstatSync(path.join(TOPIC_PATH, dir, courses[0])).isFile()){
      currentStructure[dir] = courses;
    }
  });
} else {
  console.log('The path to the topic is invalid');
  process.exit(0);
}


console.log(totalInsights);






function parseCourse(course) {
  const workouts = course.replace(/Standards[:\s]*(\r\n|\r|\n)+----------((\r\n|\r|\n)+-\s+.*)*(----------)?/g, '');
  return workouts.replace(/`/g, '').split('\n').reduce((acc, line) => {
    const wTitle = line.match(/-\s+[wW]\d+:\s*(.*)/);
    const cp = acc;
    if(wTitle) {
      const workout = {
        title: wTitle[1].trim(),
        slug: slugify(wTitle[1].trim()),
        insights: [],
      };
      cp.push(workout);
    } else if(line.match(/-\s*\w.*/) && !line.match(/-\s*[gG]ame:/)) {
      cp[cp.length - 1].insights.push(line.replace(/-\s*/, '').trim());
    }
    return cp;
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
