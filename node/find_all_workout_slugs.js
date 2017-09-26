const fs = require('fs');
const path = require('path');
const util = require('util');

const content = process.argv[2];

const topics = fs.readdirSync(content).filter(topic =>
  ['Java', 'JavaScript', 'Git', 'Linux', 'Comp. Sci.', 'CSS', 'Python'].indexOf(topic) > -1);

const workouts = [];

topics.forEach(topic => {
  fs.readdirSync(path.join(content, topic)).filter(course => !course.match(/.*\.md/)).forEach(course => {
    fs.readdirSync(path.join(content, topic, course)).filter(dir => !dir.match(/.*\.md/)).forEach(workout => {
      workouts.push(workout);
    });
  });
});

console.log(JSON.stringify(workouts, null, 2));
