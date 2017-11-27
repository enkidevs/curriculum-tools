const chai = require('chai');
const mock = require('mock-fs');
const ContentReader = require('../lib/contentReader');

chai.use(require('chai-string'));

describe('contentReader', () => {
  describe('contentPath property', () => {
    
    it('should point to the directory, not README.md, if not insight', () => {
      mock({
        'path/to': {
          'README.md': 'test: true',
          'insight.md': '# Insight\nauthor: mihaiberq',
        }
      });
      const contentReader = new ContentReader('path/to/README.md');
      chai.expect(contentReader.contentPath).not.to.endsWith('README.md');
    });

    it('should point to the insight', () => {
      const contentReader = new ContentReader('path/to/insight.md');
      chai.expect(contentReader.contentPath).to.endsWith('insight.md');
      mock.restore();
    });

  });
});
