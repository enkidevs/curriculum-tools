A workout is an ordered collection of [[Insights|Insight Documentation]]. 
Currently, workouts are defined by their _location in the repository_, and a **README.md** file that lists their contents and metadata. Each workout has a **slug**, which is a human-friendly stable moniker that can be referred to. The slug is derived from the workout's folder's name, so the folder should be lower-cased and kebab-seperated.  

Examples:
- `javascript-functions` ✅ 
- `Javascript Functions` ❌ 
- `javaScriptFunctions` ❌ 

A workout called in `/javascript/core/javascript-functions` is a workout with the slug `javascript-functions` that is located in the JavaScript Core course, and a workout located in `/python/data-structures/python-functions` is a workout with the slug `python-functions` that is located in the Python Data Structures course.

A workout's README file looks like this:

```
name: Tools

type: insights-list

description: Enhance your workflow with these tools. 

section: 1

parent: patterns

insights:
  - automatic-compilation-for-node-with-nodemon
  - how-to-debug-node-js
  - the-built-in-node-debugger
  - custom-node-repl-server
  - bulk-write-in-node-with-cork
```

### Fields Definitions

#### Name
This field is shown in the app when the user begins the workout. It needs to be short- **less than 20 characters max**.

#### Type
This should always read `insights-list`.

#### Description
This field is shown in the app when the user begins the workout. It can be a little longer, but should still remain under 100 characters.

#### Section
This field indicates what section of the course the workout is in. Users progress through sections sequentially, so if this workout contains fundamental material it should be in an earlier section than a workout that builds on that foundational material.

#### Parent
Currently this is how workouts are sequenced (think of a reverse linked-list). A user starts with the first workout in a section without a parent, and then is served the workout that has that workout as it's parent.
Soon Workouts will be sequenced in the README file of a Course. The parent is referenced by the **slug** of the workout that proceeds it.

#### Insights
This is the ordered list of Insights, referenced by their slug (the lowercase filename without the extension).


