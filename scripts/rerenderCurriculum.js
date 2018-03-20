#! usr/bin/env node

const Curriculum = require('../lib/curriculum');
const GitHub = require('../lib/networking/github');
const fs = require('fs');

const basePath = process.argv[2];

const remote = "https://github.com/enkidevs/curriculum/tree/master/";
const git = new GitHub(basePath);

const curriculum = new Curriculum(git);

// from here you can script changes to the curriculum

let allInsights = curriculum.getAllInsights()
.filter((insight) => { if (insight.contentPath) return insight.contentPath.indexOf("python/") !== -1} )

allInsights.forEach((insight) => {
    fs.writeFileSync(insight.contentPath, insight.render())
})