#! usr/bin/env node

const Curriculum = require('../lib/curriculum');
const GitHub = require('../lib/networking/github');

const basePath = process.argv[2];

const remote = "https://github.com/enkidevs/curriculum/tree/standards/";

const git = new GitHub(basePath);
const curriculum = new Curriculum(git);
const fs = require('fs');
const path = require('path');
const URL = "<MONGO URL>";
const monk = require('monk');


const db = monk(URL, {});
const insightdb = db.get("insights");


/**
 * Given a course, iterates down to the standards level for tagging purposes
 */
function standardsScrub(course) {
  // Passed in a parameter...
  var obj = {};
  for (let i in curriculum.topics) {
    let topic = curriculum.topics[i];
    for (let j in topic.courses) {
      let course = topic.courses[j];
      for (let k in course.workouts) {
        let workout = course.workouts[k];
        for (insight of workout.insights) {
          if (insight.standards != undefined) {
            insightdb.findOne({slug: insight.slug}).then((docs) => {
              console.log(docs);
            })
            for (let s in insight.standards) {
              let standard = insight.standards[s];
              // mongoose.insights.find({ "eUID" : insight.slug }).then((data) => {
              //   console.log(data);
              // })
              // mongoose.insights.find({})
              // obj[s] = "";
            }

          }
        }
      }
    }
  }
}


standardsScrub();
