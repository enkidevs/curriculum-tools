const Insight = require('../lib').Insight;
const fs = require('fs');
const path = require('path');

const insightsPath = 'fixtures/insights';

let testInsights = [];

// Preflight
for (let file of fs.readdirSync(path.join(__dirname, insightsPath))) {
    let contentPath = path.join(__dirname, `${insightsPath}/${file}`);
    let body = fs.readFileSync(contentPath, 'utf8');
    testInsights.push(new Insight({body , path : contentPath}));
}

for (let insight of testInsights) {
    test(`Insight: ${insight.title}`, function() {
        expect(insight).toHaveProperty("rawText");
        expect(insight).toHaveProperty("contentPath");
        expect(insight).toHaveProperty("slug");
        expect(insight).toHaveProperty("title");
        expect(insight).toHaveProperty("author");
        expect(insight).toHaveProperty("levels");
        expect(insight).toHaveProperty("type");
        expect(insight).toHaveProperty("title");
        expect(insight).toHaveProperty("parent");
        expect(insight).toHaveProperty("links");
        expect(insight).toHaveProperty("content");
    })
}
