#! usr/bin/env node

const Curriculum = require('../lib/curriculum');
const GitHub = require('../lib/networking/github');

const git = new GitHub()

const curriculum = new Curriculum(git)
let insights = curriculum.getAllInsights()
//console.log(curriculum.topics.javascript.courses.core)

