
const yaml = require('js-yaml');
const Content = require('./content');
const { removeEmptyObjectProperties, getMarkdownLink } = require('./helpers');
// for reading Insights from a file, and also for writing to files.
// Not meant to be the main parser, just meant to provide an abstraction for dealing with lots of curriculum.

const extractSection = ({ rawText, sectionTitle }) => {
  let startIndex = rawText.indexOf(sectionTitle) + sectionTitle.length + 1;

  // Insight does not have this section
  if (startIndex === sectionTitle.length) {
    return null;
  }
  let endIndex = rawText.indexOf('---', startIndex) === -1 ? rawText.length : rawText.indexOf('---', startIndex);
  let tempcontent = rawText.substring(startIndex, endIndex).trim();

  return tempcontent;
};

const parseQuestion = (questionText) => {
  let question = {
    rawText: questionText,
    text: '',
    answers: []
  };

  if (!questionText) {
    return question;
  }
  question.text = questionText.substring(0, questionText.indexOf('\n*'));
    
  // Get array of every bullet, then throw out the text before.
  let answerArr = questionText.split(/\n\*\s*/);

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
    this.rawText = this.rawText.replace(/\r\n/g, '\n')
    try {
      this.parse(this.rawText);
    } catch (err) {
      console.log(err);
      console.error(`Problem with ${this.contentPath}`);
      throw err;
    }

  }

  parse(text) {
    this.title = text.substring(2, text.indexOf('\n'));
    this.content = extractSection({ rawText: text, sectionTitle: '## Content' });
    this.practiceQuestion = parseQuestion(extractSection({ rawText: text, sectionTitle: '## Practice' }));
    this.revisionQuestion = parseQuestion(extractSection({ rawText: text, sectionTitle: '## Revision' }));
    this.footnotes = extractSection({ rawText: text, sectionTitle: '## Footnotes' });
    try {
      this.quizQuestion = yaml.safeLoad(extractSection({ rawText: text, sectionTitle: '## Quiz' }));
    } catch (e) {
      console.log(e);
      console.log(`Problem with ${this.contentPath}`)
    }
    this.yaml = {};
    this.footnotes = extractSection({ rawText: text, sectionTitle: '## Footnotes' });
    this.gameContent = extractSection({ rawText: text, sectionTitle: '## Game Content' });
    try {
      yaml.safeLoadAll(text.split('---')[0], (doc) => {
        for (const prop in doc) {
          this[prop] = doc[prop];
          this.yaml[prop] = doc[prop]
        }
      });

    } catch (e) {
      throw e;
    }

    if (this.links) {
      this.links = this.links.map(getMarkdownLink);
    }
  }

  /**
   * Generates markdown based on current object properties
   * @returns {string} Markdown
   */
  render() {
    let markdown = '---\n'; // Start yaml block
    let officalYAML = ['author', 'levels', 'type', 'category', 'standards', 'tags', 'links', 'inAlgoPool']
    
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
    // inAlgoPool, gotta check that it's actually defined
    if (this.inAlgoPool === false || this.inAlgoPool === true) markdown += `inAlgoPool: ${this.inAlgoPool || 'false'}\n\n`;
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
    markdown += "\n"

    // Links
    if (this.links != null && this.links.length > 0) {
      markdown += 'links:\n\n';
      for (let i in this.links) {
        markdown += `  - '[${this.links[i].name}](${this.links[i].url}){${this.links[i].nature}}'\n`;
      }
    }
    markdown += "\n"
    //other yaml
    let extraYaml = {}
    for (let prop in this.yaml) {
      if (!officalYAML.find(key => key === prop)) extraYaml[prop] = this.yaml[prop]
    }
    if (Object.keys(extraYaml).length > 0) markdown += yaml.safeDump(extraYaml)
    markdown += "\n"

    // Content
    markdown += `---\n\n# ${this.title}\n\n`
    markdown += `---\n## Content\n\n${this.content}\n\n`;
    // Practice Question
    if (this.practiceQuestion.text) {
      markdown += `---\n## Practice\n\n${this.practiceQuestion.text}\n\n`;
      for (let i in this.practiceQuestion.answers) {
        markdown += `* ${this.practiceQuestion.answers[i]}\n`;
      }
      markdown += '\n';
    }

    // Review Question
    if (this.revisionQuestion.text) {
      markdown += `---\n## Revision\n\n${this.revisionQuestion.text}\n\n`;
      for (let i in this.revisionQuestion.answers) {
        markdown += `* ${this.revisionQuestion.answers[i]}\n`;
      }
      markdown += '\n';
    }

    if (this.quizQuestion) {
      markdown += `---\n## Quiz\n`
      markdown += `### ${this.quizQuestion.headline}\n`

      markdown += `\`\`\`\n${this.quizQuestion.question}\`\`\`\n\n ???\n\n`;
      for (let i in this.quizQuestion.answers) {
        markdown += `* ${this.quizQuestion.answers[i]}\n`;
      }
      markdown += '\n';
    }
    if (this.footnotes) {
      markdown += `---\n## Footnotes\n${this.footnotes}\n`
    }

    // this should produce the text of the insight file
    return markdown;
  }

  toJSON() {
    return removeEmptyObjectProperties({
      slug: this.slug,
      headline: this.title,
      author: this.author,
      category: this.category,
      type: this.type,
      tags: this.tags,
      inAlgoPool: this.inAlgoPool,
      stub: this.stub,
      levels: this.levels,
      links: this.links,
      content: this.content,
      gameContent: this.gameContent,
      practiceQuestion: this.practiceQuestion.rawText,
      reviseQuestion: this.revisionQuestion.rawText,
      quiz: this.quizQuestion,
      footnotes: this.footnotes
    });

  }
};

