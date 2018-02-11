#! usr/bin/env node

const Curriculum = require('../lib/curriculum');
const GitHub = require('../lib/networking/github');

const basePath = process.argv[2];

const remote = "https://github.com/enkidevs/curriculum/tree/master/";
const git = new GitHub(basePath);

const curriculum = new Curriculum(git);


console.log(curriculum.topics.javascript.courses.core.render())

console.log(curriculum.topics.javascript.courses.core.workouts.forEach((w) => {console.log(w)}))
