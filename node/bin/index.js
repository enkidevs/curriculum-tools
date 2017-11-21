#! usr/bin/node

const Curriculum = require('../lib/curriculum');
const GitHub = require('../lib/networking/github');

const basePath = process.argv[2];

const git = new GitHub(basePath);
const curriculum = new Curriculum(git);
console.log(curriculum.topics.Java.renderCourses())
