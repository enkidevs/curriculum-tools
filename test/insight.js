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
      'Using `ping` To Measure Network Latency',
      'Some common terminology'
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
      'immediately-invoked-function-expression-iife',
      'some-common-terminology',
      'declaring-functions',
      'immediately-invoked-function-expression-iife'
    ]);
  })
  xit("parses the content section")
  xit("parses the content section when it contains an image")
  xit("parses the practice question")
  xit("parses the revision question")
  xit("parses the quiz question")
  xit("captures all fields defined in the yaml section")
  xit("re-renders all fields defined in the yaml section")
  xit("renders the content section")
  xit("renders the practice question")
  xit("renders the revision question")
  xit("renders the quiz question")
  xit("renders footnotes")

});
