#! usr/bin/env node

const Curriculum = require('../lib/curriculum');
const GitHub = require('../lib/networking/github');

const basePath = process.argv[2];

const remote = "https://github.com/enkidevs/curriculum/tree/master/";

const git = new GitHub(basePath);
const curriculum = new Curriculum(git);
const fs = require('fs');
const path = require('path');
let curriculumStats = curriculum.getStats();

curriculum.readCourseFile({'topic': 'blockchain', 'path': '/home/mihai/Desktop/blockchain.md'});
curriculum.createMissingFiles();
