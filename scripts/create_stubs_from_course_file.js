const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const Git = require('../lib/networking/github');
const Insight = require('../lib/insight');
const {slugify} = require('../lib/helpers');

// File location
const basePath = process.argv[2];

const git = new Git();
git.cloneRepos();


function parseWorkouts() {
  let rawContent;
  if(fs.existsSync(basePath)) {
    rawContent = fs.readFileSync(basePath, {encoding: 'utf8'});
  }

  // Split the doc into workouts
  const workouts = rawContent
    // Split workouts
    .split('###')
    // Remove any empty string
    .filter(workout => workout.length > 1)
    // Get the workout title
    .map(workout => {
      return ({
        name: workout.substring(0, workout.indexOf('\n')).trim(),
        metadata: workout.substring(workout.indexOf('\n') + 1, workout.search(/^#\s/m) - 1),
        rawData: workout.substring(workout.search(/^#\s/m)),
      })
    })
    // Parse Insights
    .map(workout => {
      workout.insights = workout.rawData.split(/^#\s/m)
        // Filter empty strings
        .filter(insight => insight.length > 1)
        // Create Insight strings
        .map(insight => {
          const backn = insight.indexOf('\n');
          const indexq = insight.search(/^##\s/m);
          // Add title
          let insightString = '# ' + insight.substring(0, backn).trim() + '\n';
          // Add metadata
          insightMeta = workout.metadata.replace(/^type:.*\n/m, '').replace(/^section:.*\n/m, '');
          insightString += insightMeta.replace(/(\r\n|\r|\n){2,}/g, '$1\n');
          insightString += `\ntype: normal\ncategory: must-know\n`;
          // Add content
          insightString += '\n---\n## Content\n\n';
          insightString += insight.substring(backn + 1, indexq - 1);
          // Add Questions
          insightString += insight.substring(indexq).replace(/^##\s/, '\n\n---\n## ');
          return ({
            title: insight.substring(0, backn).trim(),
            insightString,
          });
        });
        return workout;
    });
    return workouts;
}

function renderCourse(topicName, courseName) {
  const workouts = parseWorkouts();

  workouts.forEach((workout, ind) => {
    // Create folder
    const workoutPath = path.join(git.getCurriculumPath(), topicName, courseName, slugify(workout.name));
    if(!fs.existsSync(workoutPath)) {
      fs.mkdirSync(workoutPath);
    }
    renderReadme(workoutPath, workout, workouts[ind - 1] ? slugify(workouts[ind - 1].name) : undefined);
    workout.insights.forEach(insight => {
      renderInsight(workoutPath, insight);
    });
  });
}

function renderReadme(workoutPath, workout, parent) {
  let metadata = {};
  try {
    yaml.safeLoadAll(workout.metadata, meta => {
      for(prop in meta) {
        metadata[prop] = meta[prop];
      }
    });
  } catch (e) {
    console.log(e);
  }
  let readme = '';
  // Name
  readme += `name: ${workout.name}\n\n`;
  // Type
  readme += `type: insights-list\n\n`;
  // Description
  readme += `description: TODO\n\n`;
  // Section
  readme += `section: ${metadata.section}\n\n`;
  // Parent
  if(typeof parent !== 'undefined') {
    readme += `parent: ${parent}\n\n`;
  }
  // Insights
  readme += `insights:\n`;
  workout.insights.forEach(insight => {
    readme += `  - ${slugify(insight.title)}\n`;
  });
  fs.writeFileSync(path.join(workoutPath, 'README.md'), readme);
}

function renderInsight(workoutPath, insight) {
  fs.writeFileSync(path.join(workoutPath, slugify(insight.title) + '.md'), insight.insightString);
}

renderCourse('blockchain', 'fundamentals');
