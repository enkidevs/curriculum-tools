### What's an Insight?
An **Insight** is a short article covering a small, well-defined objective. It features metadata for analysis purposes, a practice opportunity, a question designed to test your memory, and a multiple-choice quiz-style question. If you're going to fill in an insight, check out the [[Filling in Stubs]] article for the process.


# Insight Metadata

An insight has some metadata that helps our systems organize and quantify the curriculum. It also helps us understand how well a user understands a given concept. Any metadata is supported, but there are a few that are required.

## Location-based Metadata

### **Topic**

The **topic** usually refers to the language or framework an insight exists within. **Users** _subscribe_ to **Topics**.

Take a look at our [[List of Topics]]

In this GitHub repository, every directory in the first hierarchy level represents a separate topic. To specify the **topic** of an insight simply ensure the insight’s file is placed within the right **topic** directory.

### **Course**

A **course** represents a more specific area of content. Every **course** folder is contained in a **topic** folder. Each topic in the [[List of Topics]] should have it's subtopics listed.

## `yaml`-based Metadata

The metadata at the top of every insight file is parsed using YAML. It's a human-readable, markdown-format data transport language. Below are some of the properties of an insight and what they're used for.

### **Title**
Titles are Mandatory.

The title should indicate to the user what the **Article** and **Questions* cover.
It must be between `4` and `120` characters long. The title can use `code blocks` inside it. 

The title is specified at the top of the insight file preceded with an `#`

*Note*: Keep in mind that the title of the insight is also shown with the **Revise Question**. That being said, you should take care when writing titles such that the title doesn’t directly give away the answer.  

### **Levels** (deprecated)

The **levels** field indicates the target audience of an insight, experience-wise.

The levels currently available for an insight are:

- `beginner`
- `basic`
- `medium`
- `advanced`

This allows different recipes of level combinations such as:

- `beginner` - fit for people with little to no knowledge on the subject
- `medium` , `advanced` - fit for both confident and experts
- `beginner` , `basic` , `medium` , `advanced`  - will be seen by all users, regardless of their level

We've deprecated this field in favor of a Standards based approach to quantifying experience. Level now corresponds roughly to Section.

### **Type**

Because games are fundamentally insights as well, this field is used to differentiate the type of game.

For **insights**, this field should be set to `normal`.


This field should look like:
```
    type: normal
```

### Stub
**Stubs** are insights that have questions but no accompanying text. Setting the `stub` flag to `true` will only show this insight (and it's entire containing workout) to people who have finished the last section of the course the workout is contained in. It will also show up in the [[List of Stubs]] for others to work on. If you've created a set of questions, create an insight for each question set (a PQ, an RQ, and a QQ) and set the `stub` boolean to `true`, like so:
```
    stub: true
```



### **Category**

The category field is a mandatory field.
It is used to indicate the user the type of information they are presented with.

The possible categories are:

- `fundamental`
  - the goal is to teach a core feature or fact of the **topic** or **subtopic** (e.g a core feature of `JavaScript` )
  - a feature or fact should only be considered `fundamental` if it's an important characteristic of the topic/language (in other words: *it makes it special*)
  - basic facts and features (expected and commonly found in other languages) should not be considered `fundamental`

- `feature`
  - the goal is to teach that something exists (a function, a method, etc..)
  - the insight also need to explain briefly what it does / when you might use it
  - it must be a non-trivial feature
  - the title should be the name of the feature/function/method

- `good practice`
  - This is to establish Best Practices
  - the **insight** should explain briefly why this is considered a "*good*" habit
  - it should not be black and white, as in "you should always do X", but rather as "you would want to do X under these circumstances" 
  - reviewers should not be too picky if they don't agree 100% with the recommendation (these types of insights will always sound a bit subjective)

- `how to`
  - the goal is to teach one way of doing something (typically by combining multiple functions and features)
  - the name of the insight should the name of what we want to teach to do (and NOT the name of the function or method used to do it), eg "Scrape the web with Node.js"
  - to be interesting, the insights must be teaching a particularly good way of doing something (either a short way, an efficient way, an elegant way, or an idiomatic way)

- `pattern / idioms`  
  - the goal is to teach a common pattern or topic-specific way of doing something
  - the insight must explain briefly why this is commonly used
  - the difference between `idiom` s and `how-to` s is sometimes subtle, but the presentation is typically different because an `idiom` insight should directly present a "pattern" (for the people who recognise to skip the rest of the insight), rather than presenting first a goal and then a way of achieving it
  - unlike `how-to` s, `idioms` are not necessary a "good" way of doing something, just a common way (worth learning because you will probably encounter it in existing code and will need to understand it)

- `caveats / gotchas`
  - the goal is to warn users about common bugs and misconceptions, eg `NaN === NaN` returning `false` in JavaScript.

The **category** field should look like:
```
    category: good practice
```

### Tags
Tags are for filtering and analysis, and quantifying learning.

Tags specify what **Aspect** of a course an insight contains. Add one or more of the following to the Tags section:
- Introduction: Contains parts of the course that you would show to someone if they were learning about it for the first time.
- New: Updates to the topic or subtopic, recent features or changes to an API.
- Workout: A chance to practice and simply improve your overall understanding of the entire topic.
- Deep: An insight requiring the mastery of at least two former workouts. Insights that requires you to synthesize a lot of things in order to understand. 
- Obscura: Details, stories, history, trivia

Tags also specify what general area of content the insight belongs in, smaller than the course level. `functions` is a good example, `regex` is another. 

### **Notes**

The notes field is the place where internal observations can be made on an insight.
These are not shown to the user

Simply add:

    notes: 'here is my note'

### **Links**

The Links field is where you can put additional resources. When a user bookmarks an insight, they are sent these links in an email so they can follow up in their learning. These links should:
- When possible, link to **canonical documentation**
- Link to a walkthrough or overview article that goes into depth
- Link to a **free** course or book that covers the information in the insight


To attach **links**, the following format must be used:
```
    links:

      - >-
        [facebook.github.io](https://facebook.github.io/react/tips/false-in-jsx.html){website}

    //  - >-
    //   [short-name](full-url){resource-type}
```

## Content

Content should be short and SEXI. 

Short means that they should cover the smallest possible idea in a non-exhaustive way. Typically less than 500 words, with an image or code example. Brevity is key, because these aren't meant to be a wall of text. **An Article is meant to cover only enough for the user to correctly answer the questions attached**.

SEXI is an acroynm for how explainations should be structured.
- **S** State: State or define the concept. "Functions are a way to encapsulate and reuse code."
- **E** Elaborate: Explain in more detail or qualify the concept. "Functions take an input and produce an output, and  can be composed together to control the flow of a program."
- **X** Exemplify: Give an example of when you might use this, establish context. "Functions are useful when you need to perform a repeated action and you want to give that action a name." You can also visualize the abstract form here: `function ([arg1, arg2, args...]) {[function body]}`
- **I** Illustrate: Show an example that is not abstract. `function add(a,b) { return a + b }`

Within the article one can use:
  - `code blocks`
  - `footnotes`
  - SVG Images

The maximum permitted column width of the content is `44` chars long. That means no words (or lines within code snippets) should exceed `44` chars.
If a line of your code is beyond `44` characters, please add a line break at a readable point and continue on the next line with a two-space indent to indicate continuation. This ensures the insight will be readable on a mobile screen.


The **content** of the insight is specified like:
```
---
## Content

The usage of the `false` keyword in **JSX** and implicitly **React** is worth mentioning because of its volatile behaviour.

First of all, `false` is widely used to specify that a **React** element has no child:
    
ReactDOM.render(<div>{false}</div>,
                            myNode);
    
```
## Questions

### Practice Question
Practice questions are questions presented with the insight. All practice questions should take this into account- you can reference the text. Practice questions should include the most authentic possible practice opportunity- check the objective you're trying to meet and try to create a fill-in-the-blanks challenge that includes code or terminal commands. You can ask them to choose the correct flags to append to a terminal program, for instance, because they can read what they flags are in the insight and pick the right ones.

Practice questions are formatted like this:
```
## Practice

Print "hello world" to the console:
`???.???(???)`

* `console`
* `log`
* `"hello world"`
* `print`
* `write`

```

### Revise Question
Revise questions are _assessment questions_. They are presented without the insight. Make sure they cover the same information as the practice question, and make sure it's not about trivia in the insight. They're used for placement tests, and to give points in a standard, and for other dynamic assessment. 
Try to make these questions require as much _critical thought_ as possible- the user should _figure something out_, not just be relied upon to recall details (unless the objective is to memorize the details). Don't include "remembering obscure terminal flags" in this kind of question, instead focus on what a person can be expected to recall before they've had their coffee.

Revision questions are formatted like:
```
## Revision

Print "hello world" to the console:
`???.???(???)`

* `console`
* `log`
* `"hello world"`
* `print`
* `write`

```

### Quiz Question

Quiz Questions are _trivia_ or _gotcha_ questions, requiring either encyclopedic knowledge or the ability to evaluate a deceptive expression in code. Answering them correctly should make you feel smart, and answering them incorrectly should make you feel like you want to review the content.

The **headline** is presented out of context of the question, and should be designed to ["nerd-snipe"](https://imgs.xkcd.com/comics/nerd_sniping.png) the reader. The headline is intended to feel like a challenge.
The question is the actual question to be presented to the reader once the reader "accepts the challenge" of the headline.

Answers are always multiple-choice, as these questions are often presented in interaction mediums that can only accept a single input (like the bot, or through email).

```
---
## Quiz

headline: How well do you understand the `++` operator?

question: |
  x = 1;
  x++;
  // what is the value of x

answers:
  - 2
  - 3
  - 4
  - 1 
```