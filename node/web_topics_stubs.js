const fs = require('fs');
const path = require('path');
const emoji = require('node-emoji');



const tags = ['baby', 'muscle', 'squid', 'dragon', 'sparkle', 'octopus'];
const helpers = ['white_check_mark', 'hammer_and_wrench', 'warning', 'interrobang', 'x'];
const linkMatcher = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;

let dbTags = {
  ':baby:': 'introduction',
  ':sparkles:': 'new',
  ':muscle:': 'workout',
  ':squid:': 'deep',
  ':octopus:': 'deep',
  ':dragon:': 'obscura',
};


let STRUCTURE_FILE, CONTENT_FOLDER;
const TOPIC_NAME = 'Web Topics';

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
  if(!containsLink(line)) {
    if(indent === 0) {
      if(line[0] !== '-') {
        const wTitle = emoji.strip(line).replace(/\[.*\]/, '').trim();
        const wSlug = line.match(/\[(.*)\]/) ? line.match(/\[(.*)\]/)[0] : slugify(wTitle);
        const wTags = emojiMatches.reduce((acc, em) => {
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
          content: '',
          links: [],
        }
        newCourseStructure[newCourseStructure.length - 1].insights.push(insight);
      }
      // if indent > 0
    } else if(indent > 0) {
      const lastWorkout = newCourseStructure[newCourseStructure.length - 1].insights;
      const content = lastWorkout[lastWorkout.length - 1].content + '\n' + line;
      lastWorkout[lastWorkout.length - 1].content = content;
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
        const insightContent = `# ${capitalize(insight.title)}\nauthor:\n\nlevels:\n\ntype: normal\n\ncategory:\n\n\
tags:\n${workout.tags.concat(insight.tags).reduce((acc, tag) => {
  return acc + `  - ${tag}\n`;
}, '')}
---\n## Content\n\nUseful links:\n${workout.links.concat(insight.links).reduce((acc, link) => {
  return acc + `  ${link}\n`;
}, '')}\n\
${insight.exists ? `**A version of this insight already exists with the slug ${insight.title}, which should be updated!**` : ''}
The insight should provide enough information for the following questions to be answerable:\n${insight.content}\n\n\
---\n## Practice\n\n---\n## Revision\n\n`;
        fs.writeFileSync(insightPath, insightContent);
      }
    });
  });
}

function getIndentation(string) {
  return string.search(/\S/);
}

function containsLink(string) {
  return !(!string.match(linkMatcher));
}

function slugify(title) {
  return title
      .toLowerCase()
      .replace(/\s/g,'-')
      .replace(/[^\w-]+/g,'');
}

function capitalize(string) {
  return string[0].toUpperCase() + string.substring(1);
}
