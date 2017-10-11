"use strict";

const fs = require("fs");
const path = require("path");

class Insight {
    constructor(insight) {
        var i = this;

        // Obligatory Getting-rid-of-Windows-line-ending.
        const raw = insight.replace(/\r\n/g, "\n")
        // Sometimes, answer lists are malformed. Ensure that list is propely formatted.
        .replace(/\n\*\ */g, "\n* ");

        i.title = raw.substring(raw.indexOf("#")+1, raw.indexOf("\n")).trim();

        // key-value pair from every labeled string
        (function(){
            //Change these if needed.
            const labels = ["author","type","category"];
            //Get substring from end of label => new line character
            function labelParse(label){
                if (raw.indexOf(label) > -1) i[label] = raw.substring(raw.indexOf(label+":")+label.length+1, raw.indexOf("\n",(raw.indexOf(label+":")+label.length+1))).trim();
            }
            labels.forEach((x)=> labelParse(x));
        })();

        // Parse Content from Insight
        (function(){
            var targetStr = "## Content";
            var startIndex = raw.indexOf(targetStr);
            let tempcontent = raw.substring(startIndex+targetStr.length+1, raw.indexOf("---", startIndex)).trim();
            i.content = tempcontent;
        })();

        // Parse Practice Question from Insight
        (function(){
            i.practiceQuestion = {};
            var targetStr = "## Practice";
            var startIndex = raw.indexOf(targetStr);
            // Insight does not have Pracitce Question! Exit, leaving empty object
            if (startIndex === -1) return;
            let tempcontent = raw.substring(startIndex+targetStr.length+1, raw.indexOf("---", startIndex)).trim();
            i.practiceQuestion.text = tempcontent.substring(0,tempcontent.indexOf("\n* ")).trim();
            //Get array of every bullet, then throw out the text before.
            var answerArr = tempcontent.split("\n* ");
            answerArr.shift();
            i.practiceQuestion.answers = answerArr;
        })();

        // Parse Review Question from Insight
        (function(){
            i.revisionQuestion = {};
            var targetStr = "## Revision"
            var startIndex = raw.indexOf(targetStr)
            // Insight does not have Review Question! Exit, leaving empty object
            if (startIndex === -1) return;
            let tempcontent = raw.substring(startIndex+targetStr.length+1, raw.length).trim();
            i.revisionQuestion.text = tempcontent.substring(0,tempcontent.indexOf("\n* ")).trim()
            //Get array of every bullet, then throw out the text before.
            var answerArr = tempcontent.split("\n* ");
            answerArr.shift();
            i.revisionQuestion.answers = answerArr;
        })();
    }
}

module.exports = Insight;