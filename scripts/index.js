#! usr/bin/env node

const Curriculum = require('../lib/curriculum')
const GitHub = require('../lib/networking/github')

const basePath = './'

const git = new GitHub(basePath, { pullFromBranch: false })

const curriculum = new Curriculum(git)

// from here you can script changes to the curriculum.cl
