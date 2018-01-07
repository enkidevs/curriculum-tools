//** Standards cli helper functions, for ease of creation and statistics **/
const os = require("os");
const ContentWriter = require("./contentWriter")

export class Standards extends ContentWriter() {
  constructor(path) {
    super(path)
    let pathParts = path.split("/");
    this.topicSlug = pathParts.shift();
    this.courseSlug = pathParts.shift();

    this.parse(this.rawText);
  }

  parse(rawText) {
    let lines = rawText;

    this.standard = lines.find((line) => {return line.startsWith("# ")})[0];
    //get slug
    this.slug = lines.find((line) => {return line.startsWith("slug: ")})[0];

    let requirementsStartIndex = lines.indexOf("## Assessment Requirements")
    

  }


}
