const fs = require('fs')
const path = require('path')
const { Insight } = require('../lib')
const insightDataPath = path.join(__dirname, '../test/fixtures/insights/introducing-the-osi-model.md')
const insightData = fs.readFileSync(insightDataPath, 'utf8')

const insight = new Insight({body: insightData, path: insightDataPath})

// console.log(insight.ast.children[0].data.parsedValue)
insight.setContent('asdf')
console.log(insight.getContent())
