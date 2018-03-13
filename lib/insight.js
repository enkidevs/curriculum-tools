
const yaml = require('js-yaml');
const Content = require('./content');
const { removeEmptyObjectProperties, getMarkdownLink } = require('./helpers');
const {
  getParser,
  types
} = require('@enkidevs/curriculum-parser')
const parser = getParser(types.INSIGHT)
const visit = require('unist-util-visit');
const is = require('unist-util-is');

/**
 * Given an insight string and its path, creates Insight object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Insight extends Content {
  constructor({ body, path}) {
    // allow vFile without changing interface
    if (body.cwd && body.contents) {
      body = body.contents
    }
    super({ body, path });
<<<<<<< HEAD
    try {
      this.ast = parser.parseSync(body);
      this.parse(this.ast, null, 2)
    } catch (err) {
      console.log(err);
      console.error(`Problem with ${this.contentPath}`);
      throw err;
    }
  }

  parse(ast) {
    visit(ast, (node, index, parent) => {
      //yaml nodes
      if (node.type === 'yaml') this.yaml = node.data.parsedValue
      if (node.type === 'headline') this.title = node.value
      if (node.type === 'section') {
        // handle exercise sections
        if (this.yaml.type === 'exercise' && node.name === "Exercise") {
          this.exercise = node.parsedValue
        }
        // handle content sections
        if (this.yaml.type === 'normal' && node.name === "Content") {
          this.content = node.parsedValue
        }
        // handle question sections
        if (node.name === "Practice") this.revisionQuestion = node.parsedValue
        if (node.name === "Revision") this.revisionQuestion = node.parsedValue
        if (node.name === "Quiz") this.revisionQuestion = node.parsedValue
      }
    })
=======
    this.rawText = this.rawText
      // Sometimes, answer lists are malformed. Ensure that list is propely formatted.
      .replace(/\n\s*\*\s*/g, '\n* ');

    this.parent = null;
    this.links  = null;
    this.practiceQuestion = null;
    this.revisionQuestion = null;
    this.quizQuestion = null;
    this.footnotes = null;
    this.parse(this.rawText);
  }

  parse(text) {
    this.title = text.substring(2, text.indexOf('\n'));
    this.content = extractSection({ rawText: text, sectionTitle: '## Content' });
    this.practiceQuestion = parseQuestion(
      extractSection({ rawText: text, sectionTitle: '## Practice' })
    );
    this.revisionQuestion = parseQuestion(
      extractSection({ rawText: text, sectionTitle: '## Revision' })
    );
    let tempQuizData = yaml.safeLoad(
      extractSection({ rawText: text, sectionTitle: '## Quiz' })
    );
    for (let key in tempQuizData) {
      if (typeof tempQuizData[key] === "string") tempQuizData[key] = tempQuizData[key].trim();
    }
    this.quizQuestion = tempQuizData;

    if (this.quizQuestion != null) this.quizQuestion.rawText = extractSection({ rawText: text, sectionTitle: '## Quiz' });
    
    this.footnotes = extractSection({
      rawText: text,
      sectionTitle: '## Footnotes'
    });
    this.gameContent = extractSection({
      rawText: text,
      sectionTitle: '## Game Content'
    });
    yaml.safeLoadAll(text.split('---')[0], doc => {
      for (const prop in doc) {
        this[prop] = doc[prop];
      }
    });

    if (this.links) {
      this.links = this.links.map(getMarkdownLink);
    }
    
>>>>>>> tests
  }

  /**
   * Generates markdown based on current ast
   * @returns {string} Markdown
   */
  render() {
<<<<<<< HEAD
    parser.stringifySync(this.ast)
=======
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
    // Parent
    if (this.parent != null) markdown += `parent: ${this.parent}\n\n`;
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
        markdown += `  - '[${this.links[i].name}](${this.links[i].url})'\n\n`;
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
question: |
  ${this.quizQuestion.question}

answers:
\n`;
      for (let i in this.quizQuestion.answers) {
        markdown += `  - ${this.quizQuestion.answers[i]}\n`;
      }
      markdown += '\n';
    }

    // this should produce the text of the insight file
    return markdown;
>>>>>>> tests
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
      practiceQuestion: { text: this.practiceQuestion.text, answers: this.practiceQuestion.answers},
      reviseQuestion: { text: this.revisionQuestion.text, answers: this.revisionQuestion.answers},
      quiz: this.quizQuestion,
      footnotes: this.footnotes
    });
  }
};

