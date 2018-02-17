const expect = require('chai').expect;
const Insight = require("../lib").Insight;
const fs = require("fs");

const testInsights = [];

describe('Insight', () => {
  let fixtures = [];
  before(function() {
    let files = fs.readdirSync("test/fixtures/insights");
    for (let filePath of files) {
      fixtures.push(`test/fixtures/insights/${filePath}`);
    }
    for (let i in fixtures) {
      let body = fs.readFileSync(fixtures[i]).toString();
      testInsights.push(new Insight({body, path: fixtures[i]}))
    }
  })
  it("Parses the title from the raw insight text", function(){

    testInsights.forEach((insight)=>{
      expect(insight).to.haveOwnProperty('title')
    });

    let titles = testInsights.map((insight) => {return insight.title});

    expect(titles).to.have.members([
      'Declaring Functions',
      'Immediately-Invoked Function Expression (IIFE)',
      'Multiple JOINs',
      'UNION',
      'Using `curl` To Make HTTP Requests',
      'Using `ping` To Measure Network Latency'
    ]);
  })

  it("Parses the slug from the filename", function(){

    testInsights.forEach((insight)=>{
      expect(insight).to.haveOwnProperty('slug')
    });

    let slugs = testInsights.map((insight) => {return insight.slug});

    expect(slugs).to.have.members([
      'multiple-joins',
      'union',
      'using-curl-to-make-http-requests',
      'using-ping-to-measure-network-latency',
      'declaring-functions',
      'immediately-invoked-function-expression-iife'
    ]);
  })
});
