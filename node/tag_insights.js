const fs = require('fs');
const path = require('path');
const readline = require('readline');
const yaml = require('js-yaml');

let TAGGED;
let COURSE;

if(process.argv.length > 3) {
  TAGGED = process.argv[2];
  COURSE = process.argv[3];
} else {
  console.log('Please specify the path to the local document and the path to the course.');
  process.exit(0);
}
const emojis = ['👶', '✨', '💪', '🦑', '🐉'];
const tokens = ['%introduction%', '%new%', '%workout%', '%deep%', '%novel%'];


let taggedCourse;
if(fs.existsSync(TAGGED)) {
  taggedCourse = fs.readFileSync(TAGGED, 'utf8');
  for(let i = 0; i < emojis.length; ++i) {
    taggedCourse = taggedCourse.replace(/emojis[i]/g, tokens[i]);
  }
  console.log(taggedCourse);
} else {
  console.log(`The first path (document) is invalid.`);
  process.exit(0);
}

// initial parse of the doc
const workouts = taggedCourse.replace(/`/g, '').split('\n').reduce((acc, line) => {
  const wTitle = line.match(/-\s+[wW]\d+:\s*(.*)/);
  const iSlug = line.match(/-\s+(.*\.md)/);
  const cp = acc;
  if(wTitle) {
    const workout = {
      title: wTitle[1],
      insights: [],
      tags: [],
    };
    cp.push(workout);
  } else if(iSlug) {
    cp[cp.length - 1].insights.push({
      slug: iSlug[1],
      tags: [],
    });
  }
  return cp;
}, []);

// parse tags
workouts.forEach(w => {
  const wTags = w.title.match(/%.*%/g);
  if(wTags) {
    w.tags = wTags[0].split(/[\s%]/).filter(s => s.length > 0);
    w.title = w.title.split(/%.*%/).join('').trim();
  }
  w.insights.forEach(i => {
    const iTags = i.slug.match(/%.*%/g);
    if(iTags) {
      i.tags = iTags[0].split(/[\s%]/).filter(s => s.length > 0);
      i.slug = i.slug.split(/%.*%/).join('').trim();
    }
  });
});


const dirs = fs.readdirSync(COURSE, 'utf8');

// add tags to insights
workouts.forEach(w => {
  if(dirs.indexOf(slugify(w.title) > -1)) {
    const wPath = path.join(COURSE, slugify(w.title));
    if(fs.existsSync(wPath)) {
      const mdfiles = fs.readdirSync(wPath, 'utf8');
      w.insights.forEach(i => {
        const iPath = path.join(wPath, i.slug);
        // change insight
        if(fs.existsSync(iPath)) {
          const content = fs.readFileSync(iPath, 'utf8');
          let metadata = content.split('---')[0];
          const tags = metadata.match(/tags:((\r\n|\r|\n)+\s*-\s.*)*/g);
          // the tag field is present in the current metadata
          if(tags) {
            const newTags = {
              tags: yaml.safeLoad(tags).tags.concat(w.tags).concat(i.tags),
            };
            metadata = metadata.replace(/tags:((\r\n|\r|\n)+\s*-\s.*)*/g, yaml.safeDump(newTags));
            fs.writeFileSync(iPath, metadata + '---' + content.split('---').slice(1).join('---'));
          } else {
            // if it has to be added altogether
            const newTags = {
              tags: w.tags.concat(i.tags),
            };
            if(newTags.tags.length > 0) {
              fs.writeFileSync(iPath, metadata + yaml.safeDump(newTags) + '---' + content.split('---').slice(1).join('---'));
            }
          }
        }
      });
    }
  }
});

// helper
function slugify(title) {
    return title
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'');
}
