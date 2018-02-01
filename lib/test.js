const Topic = require('./topic');
const Workout = require('./workout');
const Insight = require('./insight');
const Course = require('./course');

const sampleCourse = new Course({ body: `name: Sample
sections:
  - 0
  - 1
  - 2

description: The abstract toolkit needed for programmers to manage the complexity of problems and the problem-solving process.

next:
  - comp. sci.-networking

prerequisites:
  - comp. sci.-networking
` });

console.log(sampleCourse.toJSON());

const sampleInsight = new Insight({ body: `# Create a Database
author: SebaRaba

levels:

  - beginner

  - basic

  - medium

type: normal

category: must-know

inAlgoPool: false

tags:
  - introduction
  - workout

links:

  - '[More about how to create a database](https://www.postgresql.org/docs/9.1/static/app-createdb.html)'

---
## Content

We will create a PostgreSQL database. Using the terminal we need to enter the following command:
\`\`\`
CREATE DATABASE my_first_db;
\`\`\`
This command creates a new database called *"my_first_db"*.

Note that PostgresSQL provides users with a command line executable for creating a database. Using:
\`\`\`
createdb [options...] [dbname][description]
\`\`\`

Parameters:
- \`options\` command-line arguments, that the db accepts
- \`dbname\` database name
- \`description\` optional initial comment that can be added

The \`createdb\` command is a wrapper around the transact SQL query \`CREATE DATABASE\`. The only difference is that the former can be run from the command line and it enables users to add a initial comment in the db.


---
## Practice

Create a new database called "practice_qw".
\`\`\`
??? ??? ???
\`\`\`

* CREATE
* DATABASE
* practice_qw;
* TABLE
* DROP
* practice_qw

---
## Revision

Using \`createdb\` command, create a db called "test_db" and add an initial comment stating "DB created":
\`\`\`
??? ??? "DB created"
\`\`\`
* createdb
* test_db
* revision_qw
* LIST
* CREATE DATABASE
* practice_qw
---
## Quiz

headline: how does sorting work?

question: |
  // what will the following sorting return?
  console.log([12, 1, 5].sort());

answers:
  - "[1, 12, 5]"
  - "[1, 5, 12]"
  - "[12, 5, 1]"
  - "[12, 1, 5]"
  
---
## Footnotes

[1:\`Object.freeze\`]
For more information on *Object.freeze* see (MDN)
[https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze]` });

console.log(sampleInsight.toJSON());

const sampleWorkout = new Workout({ body: `name: Create

type: insights-list

description: Create Databases and add entities to your databases

section: 0

insights:
  - create-a-database
  - create-a-table` });

console.log(sampleWorkout.toJSON());

const javaScript = new Topic({ body: `name: SQL

language: General

icon: '[-5 -5 110 110] <path fill="#fff" d="M50 43.839c21.447 0 39.737-2.673 46.839-6.428C98.881 38.49 100 39.659 100 40.88v18.24c0 5.466-22.386 9.897-50 9.897S0 64.585 0 59.12V40.88c0-1.221 1.12-2.39 3.161-3.469 7.102 3.755 25.392 6.428 46.839 6.428zM3.161 68.393C1.12 69.473 0 70.642 0 71.862v18.24C0 95.568 22.386 100 50 100s50-4.432 50-9.897v-18.24c0-1.221-1.119-2.39-3.161-3.47-7.102 3.754-25.392 6.428-46.839 6.428s-39.737-2.674-46.839-6.428zM50 0C22.386 0 0 4.432 0 9.898v18.239c0 5.467 22.386 9.898 50 9.898s50-4.431 50-9.898V9.898C100 4.432 77.614 0 50 0z"/>'

color: 008bb9

description: All about SQL!` });

javaScript.setSlug('js');
console.log(javaScript.toJSON());
