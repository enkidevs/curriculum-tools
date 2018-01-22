#! usr/bin/env node

// Includes snippets for updating the curriculum wiki
const Curriculum = require('../lib/curriculum');
const GitHub = require('../lib/networking/github');

const basePath = process.argv[2];

const remote = "https://github.com/enkidevs/curriculum/tree/master/";

const git = new GitHub(basePath);
const curriculum = new Curriculum(git);
const fs = require('fs');
const path = require('path');
let curriculumStats = curriculum.getStats();
const {toTitleCase} = require('../lib/helpers');


/**
 * Writes all Topic pages for wiki in `curriculum.wiki` local directory
 *
 */
function writeTopicPages() {
  for (let topicName in curriculum.topics) {
    let topic = curriculum.topics[topicName];
    let data = topic.renderTopicWikiPage();
    fs.writeFileSync(path.join(basePath, `curriculum.wiki/${toTitleCase(topicName)}-Topic.md`), data);
  }
  console.info("File Write Complete")
}


/**
 * Updates LOT in local directory.. https://github.com/enkidevs/curriculum/wiki/List-of-Topics
 *
 */
function updateTopicsTable() {
  let data = curriculum.renderTopicsTable();
  fs.writeFileSync(path.join(basePath, `curriculum.wiki/List-of-Topics.md`), data);
  console.info("List-Of-Topics updated");
}

updateTopicsTable();
