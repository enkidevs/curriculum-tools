//** Standards cli helper functions, for ease of creation and statistics **/
const os = require("os");
const ContentWriter = require("./contentWriter")


/**
 * Given a standards path, creates a nested Standards object
 * @param {string} content
 * @param {string} filepath
 * @class
 * @extends Content
 */
module.exports = class Standards extends Content {
  constructor({body, path}) {
    super({body, path})
    let pathParts = path.split("/");
    this.topicSlug = pathParts.shift();
    this.courseSlug = pathParts.shift();

    this.parse(this.rawText);
  }

  parse(rawText) {
    let lines = rawText.split("\n");
    const ASSESSMENT_REQUIREMENTS_REGEX = /## Assessment Requirements/
    const DESCRIPTION_REGEX = /## Description/
    const SECTION_END_REGEX = /\-{3}/

    this.standard = lines.find((line) => {return line.startsWith("# ")})[0];
    //get slug
    this.slug = lines.find((line) => {return line.startsWith("slug: ")})[0];

    const requirementsStartIndex = lines.findIndex((line) => {return line.match(ASSESSMENT_REQUIREMENTS_REGEX)})
    const requirementsEnd = lines.findIndex((line,i) => {return (i > requirementsStartIndex) ? line.match(SECTION_END_REGEX) : false;})
    const objectives = lines.slice(requirementsStartIndex, requirementsEnd).filter((line) => {return line.length > 1});

    this.objectives = lines.map((line) => {return line.replace("- ", "").replace("1. ", "")});

    const descriptionStartIndex = lines.findIndex((line) => {return line.match(DESCRIPTION_REGEX)})
    const descriptionEnd = lines.findIndex((line,i) => {return (i > descriptionStartIndex) ? line.match(SECTION_END_REGEX) : false;})

    this.description = lines.slice(descriptionStartIndex,descriptionEnd).join("\n");

  }

/**
 * Generates markdown based on current object properties
 * @returns {string} Markdown
 */
  render() {

    return ```# ${this.standard}

slug: ${this.slug}

## Description

${this.description}

---
## Assessment Requirements
In order to fully cover this standard, a performance must be recorded for each of the following objectives:

${this.objectives.map((o) => {return `1. ${o}`}).join("\n")}

```
  }


}
