
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
  }

  /**
   * Generates markdown based on current ast
   * @returns {string} Markdown
   */
  render() {
    parser.stringifySync(this.ast)
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

