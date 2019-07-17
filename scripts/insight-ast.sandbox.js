const fs = require('fs')
const path = require('path')
const { Insight } = require('../lib')
const insightDataPath = path.join(__dirname, '../test/fixtures/insights/successful-status-codes.md')
const insightData = fs.readFileSync(insightDataPath, 'utf8')

const insight = new Insight({body: insightData, path: insightDataPath})

console.log(insight.getPracticeQuestion().text)
