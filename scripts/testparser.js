const {
    getParser,
    types
} = require('@enkidevs/curriculum-parser')

const exercise = `
---
author: sebaraba

levels:

  - beginner

  - basic

  - medium


tags:

  - introduction

  - workout

  - deep


type: exercise



linkType: sqlfiddle
link: http://sqlfiddle.com/#!9/b3fa3a
answer: 995


standards:
  sql.dql.aggregate-single-table.0: 1000

links:

- '[link to official documentation](https://enki.com)'
- '[link to deeper dive blog post](https://enki.com)'
- '[link to a video](https://enki.com)'
- '[link to a discussion](https://enki.com)'
---

# Aggregate Single Table

---
## Exercise

Compute the sum of \`base_experience\` for all \`pokemon\` that are not \`default\`.
`

const ast = getParser(
    types.INSIGHT
).parseSync(
    exercise
);

(function clean(node) {
    delete node.position
    if (Array.isArray(node.children)) {
        node.children.forEach(clean)
    }
})(ast)

console.log(
    JSON.stringify(ast, null, 2)
)