const request = require('request')

const options = {
  url: 'https://api.github.com/repos/enkidevs/curriculum/stats/contributors'
}

function consolidate (contributor) {
  let tempContributorData = {
    a: 0,
    d: 0,
    c: 0
  }

  // Get the last 4 weeks of data and consolidate them.
  contributor.weeks.slice(contributor.weeks.length - 5, contributor.weeks.length - 1)
    .forEach(week => {
      tempContributorData.a += week.a
      tempContributorData.d += week.d
      tempContributorData.c += week.c
    })
  contributor.monthData = tempContributorData
}

request.get(options, (err, response, body) => {
  if (err) throw new Error(err)

  body = JSON.parse(body).forEach(contributor => { consolidate(contributor) })

  // Sort contributors by monthly contributions
  body.sort((a, b) => {
    return (b.monthData.a - b.monthData.d) - (a.monthData.a - a.monthData.d)
  })

  // Console log names in descending order
  body.map(x => { console.log(x.author.login) })
})
