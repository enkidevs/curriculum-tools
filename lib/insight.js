const yaml = require('js-yaml');
const Content = require('./content');
const { removeFalsy } = require('./helpers');
// for reading Insights from a file, and also for writing to files.
// Not meant to be the main parser, just meant to provide an abstraction for dealing with lots of curriculum.

const extractSection = ({ rawText, sectionTitle }) => {
  let startIndex = rawText.indexOf(sectionTitle) + sectionTitle.length + 1;

  // Insight does not have Quiz Question!
  if (startIndex === sectionTitle.length) {
    return null;
  }
  let endIndex = rawText.indexOf('---', startIndex) === -1 ? rawText.length : rawText.indexOf('---', startIndex);
  let tempcontent = rawText.substring(startIndex, endIndex).trim();

  return tempcontent;
};

const parseQuestion = (questionText) => {
  let question = {
    text: null,
    answers: []
  };

  question.text = questionText.substring(0, questionText.indexOf('\n* ')).trim();
  // Get array of every bullet, then throw out the text before.
  let answerArr = questionText.split('\n* ');

  answerArr.shift();
  answerArr.filter(e => Boolean(e)); // sometimes there are empty answers
  question.answers = answerArr;
  return question;
};

/**
 * Given an insight string and its path, creates Insight object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Insight extends Content {
  constructor({ body, path }) {
    // Should take an object
    // Content reader and writer should combine into ReaderWriter and live in curriculum
    // Each one of the contentType files (Course/Insight ...) should take in the text and path
    /**
    new Content({body: text, path: path})
    **/
    super({ body, path });
    // Obligatory Getting-rid-of-Windows-line-ending.
    this.rawText = this.rawText.replace(/\r\n/g, '\n').replace(/\n *\* */g, '\n* ');
    // Sometimes, answer lists are malformed. Ensure that list is propely formatted.
    try {
      this.parse(this.rawText);
    } catch (err) {
      console.error(`Problem with ${this.contentPath}`);
    }
  }

  parse(text) {
    this.title = text.substring(2, text.indexOf('\n'));
    this.content = extractSection({ rawText: text, sectionTitle: '## Content' });
    this.practiceQuestion = parseQuestion(extractSection({ rawText: text, sectionTitle: '## Practice' }));
    this.revisionQuestion = parseQuestion(extractSection({ rawText: text, sectionTitle: '## Revision' }));
    try {
      this.quizQuestion = yaml.safeLoad(extractSection({ rawText: text, sectionTitle: '## Quiz' }));
    } catch (e) {
      console.log(e);
    }
    this.footnotes = extractSection({ rawText: text, sectionTitle: '## Footnotes' });
    // this.gameContent = extractSection({ rawText: text, sectionTitle: '## Game Content' });
    try {
      yaml.safeLoadAll(text.split('---')[0], (doc) => {
        for (const prop in doc) {
          this[prop] = doc[prop];
        }
      });

    } catch (e) {
      console.error(e, this.contentPath);
    }
  }

  /**
   * Generates markdown based on current object properties
   * @returns {string} Markdown
   */
  render() {
    let markdown = '';

    // Title
    markdown += `# ${this.title}\n`;
    // Author
    if (this.author != null) {
      markdown += `author: ${this.author}\n\n`;
    }
    // Levels
    if (this.levels != null) {
      markdown += 'levels:\n\n';
      for (let i in this.levels) {
        markdown += `  - ${this.levels[i]}\n\n`;
      }
    }

    // Type with fallback
    markdown += `type: ${this.type || 'normal'}\n\n`;
    // Category with fallback
    markdown += `category: ${this.category || 'must-know'}\n\n`;
    // Standards
    if (this.standards != null) {
      markdown += 'standards:\n\n';
      for (let i in this.standards) {
        markdown += `  - ${i}: ${this.standards[i]}\n\n`;
      }
    }
    // Tags
    if (this.tags != null) {
      markdown += 'tags:\n\n';
      for (let i in this.tags) {
        markdown += `  - ${this.tags[i]}\n\n`;
      }
    }

    // Links
    if (this.links != null && this.links.length > 0) {
      markdown += 'links:\n\n';
      for (let i in this.links) {
        markdown += `  - >-\n    ${this.links[i]}\n\n`;
      }
    }

    // Content
    markdown += `---\n## Content\n\n${this.content}\n\n`;

    // Practice Question
    if (this.practiceQuestion.text != null) {
      markdown += `---\n## Practice\n\n${this.practiceQuestion.text}\n\n`;
      for (let i in this.practiceQuestion.answers) {
        markdown += `* ${this.practiceQuestion.answers[i]}\n`;
      }
      markdown += '\n';
    }

    // Review Question
    if (this.revisionQuestion.text != null) {
      markdown += `---\n## Revision\n\n${this.revisionQuestion.text}\n\n`;
      for (let i in this.revisionQuestion.answers) {
        markdown += `* ${this.revisionQuestion.answers[i]}\n`;
      }
      markdown += '\n';
    }

    if (this.quizQuestion != null) {
      markdown += `---\n## Quiz\n\nheadline: ${this.quizQuestion.headline}\n
question: ${this.quizQuestion.question}\n\nanswers:\n`;
      for (let i in this.quizQuestion.answers) {
        markdown += `  - ${this.quizQuestion.answers[i]}\n`;
      }
      markdown += '\n';
    }

    // this should produce the text of the insight file
    return markdown;
  }

  toJSON() {
    return removeFalsy({
      slug: this.slug,
      author: this.author,
      type: this.type,
      // note rename here
      headline: this.title,
      content: this.content,
      footnotes: this.footnotes,
      gameContent: this.gameContent,
      category: this.category,
      links: this.links,
      tags: this.tags,
      inAlgoPool: this.inAlgoPool,
      stub: this.stub,
      levels: this.levels
    });

  }
};

