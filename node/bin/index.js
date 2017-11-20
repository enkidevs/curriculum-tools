#! usr/bin/node

let os = require('os');
let Curriculum = require('../lib/curriculum.js')

let [contentPath, standardsPath] = [process.argv[2], process.argv[3]];
if (!contentPath) contentPath = `${os.homedir()}/src/curriculum`
if (!standardsPath) standardsPath = `${os.homedir()}/src/standards`


let curriculum = new Curriculum(contentPath, standardsPath);
