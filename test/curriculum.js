const expect = require('chai').expect;
let CurriculumTools = require("../index.js");
let Curriculum = CurriculumTools.Curriculum;
let Networking = CurriculumTools.Networking;
// here's where the mock goes, for now we're just gonna do it for real.
let curriculum = new Curriculum(new Networking())

describe("Curriculum", () => {
    // some notes on testing curriculum:
    // Curriculum is a class that does curriculum-wide operations, such as reading the folder structure and organizing the curriculum according to the folder structure.
    // as such, it doesn't really make sense to test it with anything other than a specific branch of the curriculum.
    // setting this to a different branch temporarily will allow you to test reformats, etc.
    // but this should be viewed as an integration test suite.
    before(() =>{
        curriculum.read()
    })

    it("should be able to find topics of the curriculum by their element and slug", () => {
        let jsTopic = curriculum.findElementBySlug(
            "topic",
            "javascript"
        );
        expect(jsTopic).to.haveOwnProperty("name")
        expect(jsTopic.name).to.be.eq("JavaScript")
    })
    it("should be able to find courses in the curriculum by their element and slug", () => {
        let jsCore = curriculum.findElementBySlug(
            "course",
            "javascript:core"
        );
        console.log(jsCore)
        expect(jsCore).to.haveOwnProperty("workouts")
        expect(jsCore.workouts.length).to.be.gt(0)
    })
    it("should be able to find Workouts in the curriculum by their element and slug", () => {
        let jsAsyncWorkout = curriculum.findElementBySlug(
            "workout",
            "javascript:core:async"
        );
        expect(jsAsyncWorkout).to.haveOwnProperty("name")
        expect(jsAsyncWorkout.name).to.be.eq("How to Async")
    })
})