const fs = require('fs');
const path = require('path');
const emoji = require('node-emoji');
const {getIndentation, containsLink,
  slugify, capitalize, hasDash} = require('./helpers');


const tags = ['baby', 'muscle', 'squid', 'dragon', 'sparkle', 'octopus'];
const helpers = ['white_check_mark', 'hammer_and_wrench', 'warning', 'interrobang', 'x'];
const linkMatcher = /^\s*https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)\s*/gi;

let dbTags = {
  ':baby:': 'introduction',
  ':sparkles:': 'new',
  ':muscle:': 'workout',
  ':squid:': 'deep',
  ':octopus:': 'deep',
  ':dragon:': 'obscura',
};


let STRUCTURE_FILE, CONTENT_FOLDER;
const TOPIC_NAME = 'Web';

if(process.argv.length > 3) {
  [STRUCTURE_FILE, CONTENT_FOLDER] = process.argv.slice(2);
} else {
  console.log('Please pass the new structure doc path and content folder path.');
  process.exit(0);
}

if(!fs.existsSync(path.join(CONTENT_FOLDER, TOPIC_NAME))) {
  fs.mkdirSync(path.join(CONTENT_FOLDER, TOPIC_NAME));
}
const COURSE_NAME = STRUCTURE_FILE.split(path.sep).slice(-1)[0].replace(/\.\w*/, '');
const COURSE_PATH = path.join(CONTENT_FOLDER, TOPIC_NAME, COURSE_NAME);

if(!fs.existsSync(COURSE_PATH)) {
  fs.mkdirSync(COURSE_PATH);
  fs.writeFileSync(path.join(COURSE_PATH, 'README.md'), 'sections: \n  - 0\n\ndescription: TODO');
}

const newCourseStructure = [];

fs.readFileSync(STRUCTURE_FILE, 'utf8').split('\n').forEach(line => {
  const indent = getIndentation(line);
  const emojiMatches = emoji.unemojify(line).match(/:(\w|_)*:/g);
  if(!containsLink(line, linkMatcher)) {
    if(indent === 0) {
      if(line[0] !== '-') {
        const wTitle = emoji.strip(line).replace(/\[.*\]/, '').trim();
        const wSlug = line.match(/\[(.*)\]/) ? line.match(/\[(.*)\]/)[0] : slugify(wTitle);
        const wTags = (emojiMatches || []).reduce((acc, em) => {
          if(dbTags[em]) acc.push(dbTags[em]);
          return acc;
        }, []);
        newCourseStructure.push({
          title: wTitle,
          slug: wSlug,
          tags: wTags,
          indent,
          insights: [],
          links: [],
        });
      } else {
        const exists = emoji.unemojify(line).indexOf(':x:') === -1;
        const iTitle = emoji.strip(line).substring(1).trim();
        const iSlug = slugify(iTitle);
        const iTags = (emojiMatches || []).reduce((acc, em) => {
          if(dbTags[em]) acc.push(dbTags[em]);
          return acc;
        }, []);
        const insight = {
          title: iTitle,
          slug: iSlug,
          tags: iTags,
          indent,
          exists,
          qs: [],
          links: [],
        }
        newCourseStructure[newCourseStructure.length - 1].insights.push(insight);
      }
      // if is part of insight
    } else if(indent > 0) {
      const lastWorkout = newCourseStructure[newCourseStructure.length - 1].insights;
      const tfMatcher = /\(?[tT]\/[fF]\)?\s*:?\s*/;
      const dashMatcher = /^\s*-\s*/;
      const qsIndex = lastWorkout[lastWorkout.length - 1].qs.length - 1;
      if(line.match(tfMatcher)) {
        lastWorkout[lastWorkout.length - 1].qs.push({
          text: line.replace(dashMatcher, '').replace(tfMatcher, '').trim() + '\n',
          indent,
          type: 'RQ',
          answer: '',
        });
      } else if(indent === 2) {
        if(lastWorkout[lastWorkout.length - 1].qs[qsIndex] && lastWorkout[lastWorkout.length - 1].qs[qsIndex].answer.length === 0) {
          lastWorkout[lastWorkout.length - 1].qs[qsIndex].text += line.replace(dashMatcher, '') + '\n';
        } else {
          lastWorkout[lastWorkout.length - 1].qs.push({
            text: line.replace(dashMatcher, '').trim() + '\n',
            indent,
            type: 'PQ',
            answer: '',
          });
        }
      } else if(!hasDash(line)) {
        lastWorkout[lastWorkout.length - 1].qs[qsIndex].text += line + '\n';
      } else {
        lastWorkout[lastWorkout.length - 1].qs[qsIndex].answer += line.replace(dashMatcher, '').trim() + '\n';
      }
    }
    // contains link
  } else {
    if(indent === 0) {
      newCourseStructure[newCourseStructure.length - 1].links.push(line);
    } else if(indent === 2) {
      newCourseStructure[newCourseStructure.length - 1]
        .insights[newCourseStructure[newCourseStructure.length - 1].insights.length - 1].links.push(line);
    }
  }
});

createStubs(newCourseStructure);

function createStubs() {
  newCourseStructure.forEach((workout, ind) => {
    const workoutPath = path.join(COURSE_PATH, workout.slug);
    if(!fs.existsSync(workoutPath)) {
      fs.mkdirSync(workoutPath);
      const workoutMetadata = `name: ${workout.title}\n\ntype: insights-list\n\ndescription: TODO\n\nsection: 0\n
${ind ? `parent: ${newCourseStructure[ind - 1].slug}\n\n`: ''}insights:\n\
${workout.insights.reduce((acc, insight) => {
  return acc + `  - ${insight.slug}\n`;
}, '')}`;
      fs.writeFileSync(path.join(workoutPath, 'README.md'), workoutMetadata);
    }
    workout.insights.forEach(insight => {
      const insightPath = path.join(workoutPath, insight.slug + '.md');
      if(!fs.existsSync(insightPath)) {
        const insightContent = `# ${capitalize(insight.title)}\nauthor: mihaiberq\n\nlevels:\n  - beginner\n  - basic\n
type: normal

category: must-know

stub: true

tags:\n${workout.tags.concat(insight.tags).reduce((acc, tag) => {
  return acc + `  - ${tag}\n`;
}, '')}

---
## Content

${insight.exists ? `**A version of this insight already exists with the slug ${insight.title}, which should be updated!**` :
 'New content to go here. The author must be updated to match a valid Enki account.'}

${parseQuestions(insight)}`;
        fs.writeFileSync(insightPath, insightContent);
      }
    });
  });
}

function parseQuestions(insight) {
  let pqs = insight.qs.filter(question => question.type === 'PQ');
  let rqs = insight.qs.filter(question => question.type === 'RQ');
  if(pqs.length == 0) {
    if(rqs.length > 1) {
      pqs = rqs.splice(0, Math.ceil(rqs.length / 2));
    }
  } else if(rqs.length == 0) {
    if(pqs.length > 1) {
      rqs = pqs.splice(0, Math.ceil(pqs.length / 2));
    }
  }
  return printQuestions(pqs, rqs);
}

function printQuestions(pqs, rqs) {
  let questions = '';
  // Practice questions
  let pqRight = [];
  let pqLeft = [];
  if(pqs.length) {
    questions += '---\n## Practice\n';
    pqs.forEach(pq => {
      questions += '\n' + pq.text + '\n';
      if(pq.text.match(/\?\?\?/g)) {
        const rightAnswers = pq.answer.trim().split('\n').splice(0, pq.text.match(/\?\?\?/g).length);
        pqRight = pqRight.concat(rightAnswers);
        pqLeft = pqLeft.concat(pq.answer.trim().split('\n').splice(pq.text.match(/\?\?\?/g).length));
      } else if(pq.answer.indexOf('*') > -1) {
        const rightAnswers = pq.answer.trim().split('\n').splice(0, pq.answer.match(/\*/g).length).map(ans => ans.replace('*', ''));
        pqRight = pqRight.concat(rightAnswers);
        pqLeft = pqLeft.concat(pq.answer.trim().split('\n').splice(pq.answer.match(/\*/g).length));
        for(x of rightAnswers) {
          questions += '???\n';
        }
      } else {
        const rightAnswers = pq.answer.trim().split('\n');
        for(x of rightAnswers) {
          questions += '???\n';
        }
        pqRight = pqRight.concat(rightAnswers);
      }
    });
    questions += '\n';
    pqRight.forEach(pqR => questions += `* ${pqR}\n`);
    pqLeft.forEach(pqL => questions += `* ${pqL}\n`);
  }
  // Revision questions
  let rqRight = [];
  let rqLeft = [];
  if(rqs.length) {
    questions += '\n\n---\n## Revision\n';
    rqs.forEach(rq => {
      questions += '\n' + rq.text + '\n';
      if(rq.text.match(/\?\?\?/g)) {
        const rightAnswers = rq.answer.trim().split('\n').splice(0, rq.text.match(/\?\?\?/g).length);
        rqRight = rqRight.concat(rightAnswers);
        rqLeft = rqLeft.concat(rq.answer.trim().split('\n').splice(rq.text.match(/\?\?\?/g).length));
      } else if(rq.answer.indexOf('*') > -1) {
        const rightAnswers = rq.answer.trim().split('\n').splice(0, rq.answer.match(/\*/g).length).map(ans => ans.replace('*', ''));
        rqRight = rqRight.concat(rightAnswers);
        rqLeft = rqLeft.concat(rq.answer.trim().split('\n').splice(rq.answer.match(/\*/g).length));
        for(x of rightAnswers) {
          questions += '???\n'
        }
      } else {
        const rightAnswers = rq.answer.trim().split('\n');
        questions += '???\n';
        rqRight = rqRight.concat(rightAnswers);
      }
    });
    rqRight.forEach(rqR => questions += `* ${rqR}\n`);
    rqLeft.forEach(rqL => questions += `* ${rqL}\n`);
  }
  return questions;
}
