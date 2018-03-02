const Topic = require('../lib/topic');



describe('Topic tests', () => {

  test('Valid topic should be parsed with no problems and class should internally have all properties', () => {
    const topicRawText = `name: JavaScript
description: My description

color: 312fec
    
language: js`;

    const topic = new Topic({body: topicRawText});
    expect(topic).toBeDefined();
    expect(topic.name).toBeTruthy();
    expect(topic.description).toBeTruthy();
    expect(topic.color).toBeTruthy();
    expect(topic.language).toBeTruthy();
  });

  test('Parsing invalid yaml should throw error', () => {
    const topicWithInvalidYAML = `name:BadName 
description: >2
color: 3431f`;

    try {
      new Topic({body: topicWithInvalidYAML});
      // eslint-disable-next-line
      fail();
    } catch (error) {
      Promise.resolve();
    }
  });
});