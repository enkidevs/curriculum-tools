#! usr/bin/env node

const Curriculum = require('../lib/curriculum');
const GitHub = require('../lib/networking/github');

const basePath = process.argv[2];

const remote = "https://github.com/enkidevs/curriculum/tree/master/";
const git = new GitHub(basePath);

const curriculum = new Curriculum(git);


for (let topicSlug in curriculum.topics) {
    for (let courseSlug in curriculum.topics[topicSlug].courses) {
        let course = curriculum.topics[topicSlug].courses[courseSlug]
        course.render()
    }
}

