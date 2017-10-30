This guide really covers the idea of lesson planning in general, and how we do it.

Professional teachers who create great materials all swear by a process called Backwards Design. You're probably familiar with this process as an engineer, we'd call it Writing a Specification Sheet. The idea is the same- start with a vision of what you want the end product to look like. 

When you're creating software, you specify user actions as **features**. In education, we specify learner skills as **Standards**. Standards are a description of an action that you want someone to be able to do after they consume your learning materials. Just like features, it helps to use very specific language to describe these actions. Standards should thus feature an **Understanding Verb** which helps us know what level of understanding someone needs in order to have met the Standard. Standards should also have a direct object, because context is key when evaluating someone's ability to do something.

Here are some examples of standards:

* [Analyse the complexity of common data structure access operations](https://github.com/sagelabs/standards/blob/master/computer_science/core/analyze-the-complexity-of-common-data-structure-access-operations.md)
* [Identify JavaScript Syntax](https://github.com/sagelabs/standards/blob/master/javascript/core/identify-javascript-syntax.md)
* [Evaluate JavaScript Expressions](https://github.com/sagelabs/standards/blob/master/javascript/core/evaluate-javascript-expressions.md)
* [Use browser APIs to store and manage data on the client](https://github.com/sagelabs/standards/blob/master/javascript/browser-apis/use-browser-apis-to-store-and-manage-data-on-the-client.md)

There are several key parts to point out in these examples.
First, look at the verbs at the start of each sentence. These are all examples of common tasks developers need to learn- Identification, Evaluation, Use (write code that), and Analyse. They all require a specific level of understanding to accomplish- the identification that something _is_ a function has nothing to do with writing _effective_ functions. These special verbs can taxonomize different levels of understanding- one way to do so is represented by Bloom's Taxonomy:
![](https://i.pinimg.com/originals/25/e5/8c/25e58c613451a2acb35be92e4a9df254.png)

We want to avoid the verb "understand" or "know", because they tell us absolutely nothing about what level of knowledge a person actually has. Often when educators get started writing standards, what they end up doing first is listing a lot of facts they want the learner to memorize such as, "Understand that automatic semicolon insertion is a feature of JavaScript". This is simply a trivial fact with the words "understand that" in front of it, not a measurement of performance. What the creator of this standard is likely trying to find out is if the user can "evaluate javascript syntax" and "write javascript syntax" correctly, which involves a large number of things that can be listed as objectives so as to be sure to cover them, but are too trivial to _track individually_. The correct standards also cover the evaluation of the syntax separately from the writing of the syntax, because they are different levels of understanding. "Understand that" doesn't really tell you what a person could _do_ with that understanding, and so it doesn't contain enough context for us to actually _test_ whether a learner can meet a standard. 

The point of standards is so that you _test them_, so they must be provable. To create curriculum at Enki, you'll create an opportunity to practice a standard, and an opportunity for you to prove that you can meet the standard. Standards have Objectives, which cover the scope of the Standard- what performances of what specific element of the skill are required? This is where you can list out the details of what you consider the skill to be. For the standard **Analyze the complexity of common data structure access operations**, we added these objectives to describe what "common" means, and what "analyze" really consists of:
- Accurately describe the complexity of Array access, search, insertion, and deletion
- Accurately describe the complexity of Stack access, search, insertion, and deletion
Here
- Accurately describe the complexity of Queue access, search, insertion, and deletion
- Accurately describe the complexity of Doubly and Singly Linked List access, search, insertion, and deletion, and contrast the differences
- Accurately describe the complexity of Hash Table access, search, insertion, and deletion
- Accurately describe the complexity of Skip List access, search, insertion, and deletion
- Accurately describe the complexity of Binary Search Tree access, search, insertion, and deletion
- Accurately describe the complexity of Cartesian Tree access, search, insertion, and deletion
- Accurately describe the complexity of B-Tree access, search, insertion, and deletion
- Accurately describe the complexity of Red-Black Tree access, search, insertion, and deletion
- Accurately describe the complexity of Splay Tree access, search, insertion, and deletion
- Accurately describe the complexity of AVL Tree access, search, insertion, and deletion
- Accurately describe the complexity of KD Tree access, search, insertion, and deletion

Once you have a Standard and Objectives, create some Questions for each Objective. Create Revision Questions first, then Practice Questions- write questions that you feel someone should be able to answer if they could perform the task described by the Standard or Objective. Write however many you feel you need to prove that someone has fully covered the Standard- you need at least 1 for each Objective. Once you have an equal number of practice and revision questions, it's time to create Insights. 

Add the questions, write Insights that explain enough to cover the material that's covered by the question. It's ok if the question doesn't exhaustively cover every detail, you can go into more detail than the question covers, but try to keep the insight short. Read the [[Insight Documentation]] for more. Once you have one for each, split them into workouts. Workouts should be about 5 minutes long for the average user, so you may end up with one workout per objective or one insight per objective, depending on how many questions you want to ask and how exhaustively you want to cover the topic.
