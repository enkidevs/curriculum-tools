import os

insights_stats = {
    "insights": 0,
    "total content length": 0,
    "questions" : 0,
    "insights with questions" : 0
}

# get top level dir names so we can treat them differently


def visit(insights_stats, dirname, files):
    if ".git" not in dirname and ".archived" not in dirname:
        if len(dirname.split("/")) == 3:
            dot, subject, subtopic = dirname.split("/")
        if len(dirname.split("/")) == 2:
            dot, subject = dirname.split("/")
            subtopic = None
        if len(dirname.split("/")) == 1:
            dot, subject, subtopic = dirname.split("/"), None, None
        if subject and not insights_stats.get(subject):
            insights_stats[subject] = {}
        if subtopic and not insights_stats[subject].get(subtopic):
            insights_stats[subject][subtopic] = {
                "count": 0,
                "question count": 0,
                "revision question count": 0,
                "practice question count": 0,
                "name": subject + " " + subtopic
            }



        if subtopic and subject:
            stats = insights_stats[subject][subtopic]


            for name in files:
                if name != "README.md":
                    stats["count"] += 1
                    insight_file = open(dirname + "/" + name)
                    insight_body = insight_file.read()
                    insight_file.close()

                    insights_stats["insights"] += 1
                    has_questions = False
                    if "## Practice" in insight_body:
                        insights_stats["questions"] += 1
                        stats["question count"] += 1
                        stats["practice question count"] += 1
                        has_questions = True
                    if "## Revision" in insight_body:
                        insights_stats["questions"] += 1
                        stats["question count"] += 1
                        stats["revision question count"] += 1
                        has_questions = True
                    if has_questions:
                        insights_stats["insights with questions"] += 1


            print subject, subtopic, stats




os.path.walk(".", visit, insights_stats)

print "insights", insights_stats["insights"],
print "total content length", insights_stats["total content length"],
print "questions", insights_stats["questions"],
print "insights with questions", insights_stats["insights with questions"],
