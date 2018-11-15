require('jest-extended')
const { Insight } = require('../lib')
const fs = require('fs')
const path = require('path')
const flatten = require('lodash.flatten')
const { getParser } = require('@enkidevs/curriculum-parser')
const { contentTypes } = require('@enkidevs/curriculum-helpers')
const parser = getParser(contentTypes.INSIGHT)
const visit = require('unist-util-visit')

const insightsPath = 'fixtures/insights'

const testInsights = []

describe('Insight', () => {
  beforeAll(() => {
    for (const file of fs.readdirSync(path.join(__dirname, insightsPath))) {
      const contentPath = path.join(__dirname, `${insightsPath}/${file}`)
      const body = fs.readFileSync(contentPath, 'utf8').toString()
      testInsights.push(new Insight({body, path: contentPath}))
    }
  })

  test('parses the title from the raw insight text', () => {
    const possibleTitles = [
      'Declaring Functions',
      'Immediately-Invoked Function Expression (IIFE)',
      'Multiple JOINs',
      'UNION',
      'Using `curl` To Make HTTP Requests',
      'Using `ping` To Measure Network Latency',
      'External Configuration Files',
      'Functional Components',
      'Introducing the OSI Model',
      'LEFT And RIGHT JOINs',
      'Some common terminology',
      'Successful status codes',
      'Using tags for version control'
    ]
    const titles = testInsights.map(insight => insight.getTitle())
    titles.forEach(title => {
      expect(title).toBeDefined()
      expect(possibleTitles).toContain(title)
    })
  })

  test('parses the slug from the filename', () => {
    const possibleSlugs = [
      'multiple-joins',
      'union',
      'using-curl-to-make-http-requests',
      'using-ping-to-measure-network-latency',
      'declaring-functions',
      'immediately-invoked-function-expression-iife'
    ]

    testInsights.forEach(insight => {
      expect(insight).toHaveProperty('slug')
    })
    const slugs = testInsights.map(insight => insight.slug)

    expect(slugs).toEqual(expect.arrayContaining(possibleSlugs))
  })

  test('parses the content section from the raw insight text', () => {
    const possibleContents = [
      'JavaScript supports a number of different ways of declaring functions.\n\nThe most common is the *function declaration*:\n\n```\n//function to add 2 parameters\nfunction add(x, y){\n\treturn x + y;\n}\n\nadd(1,2);//3\n```\n* *Return Values**\n\nIn the above example we specified that we would return the function argument x plus argument y. \n\nIf we did not specify a return value in the above example then the function would return *undefined* e.g.\n\n``` \nfunction add(x, y){\n\tx + y;\n}\n\nadd(1,2);//undefined\n```\n\nNote that there are some more complex cases where a function will not return *undefined* when no return is specified.',
      'JavaScriptsupports a number of different ways of declaring functions.The most common is the *function declaration*:```bash//function to add 2 parametersfunction add(x, y){    return x + y;}add(1,2);//3```**Return Values**In the above example we specified that we would return the function argument x plus argument y. If we did not specify a return value in the above example then the function would return *undefined* e.g.```bashfunction add(x, y){    x + y;}add(1,2);//undefined```Note that there are some more complex cases where a function will not return *undefined* when no return is specified.',
      'It is easy to configure *Gulp* to use an external configuration file. \n\nThis is a great way to keep settings organised, versioned, accessible by other build tools and distinct from the build process.\n\nCreate a file called *config.json* to hold the settings:\n```\n{\n   "destination" : "wwwroot\\\\"\n}\n```\n\nThen in *gulpfile.js* import *config.json* as you would any other module:\n\n```\nvar gulp   = require(\'gulp\');\nvar config = require(\'./config.json\');\n```\n\nWe can now access properties on the config object easily and use them in Gulp tasks:\n```\ngulp.task(\'get-destination\', function() {\n   console.log(config.destination);\n});\n```',
      'As stated before, **React** components behave just like functions, taking `props` as input and returning **React elements**. \n\nSimple `component`s that don\'t have an internal `state` and don\'t make use of any **lifecycle** methods such as `constructor()` can be written as **functional components**.\n\nConsider the component:\n```jsx\nclass Enki extends React.Component {\n  render() {\n    return <p>{this.props.enki}</p>;\n  }\n}\n```\n\nA **stateless** component is **functional** when written literally as a `JS` function:\n```jsx\nfunction Enki(props) {\n  return <p>{props.enki}</p>;\n}\n```\n\nThe two components defined above are completely equivalent from **React**\'s point of view.\n* *Functional components** are preferred for **UI** because they enforce the best practice of having *dumb presentational components*, but also require less typing (e.g. no `this` keyword).',
      'A common pattern in JavaScript is the Immediately-Invoked Function Expression or IIFE.\n\nIIFE\'s are nameless or anonymous functions that are executed immediately.\n\nThey have the following structure:\n\n```\n(function(){\n   ...\n})();\n```\n\nThe main benefit of IIFE\'s is restricting access to variables contained within.\n\nWhen a function runs it creates its own execution context and by creating a function and running it immediately we ensure that the variables contained are inaccessible to external code.\n\nIIFE\'s are a very useful approach for organising code and frequently used in libraries and frameworks.',
      'The `LEFT JOIN`, or `LEFT OUTER JOIN`, is a type of join whose result contains **all** rows in the first table, regardless of whether there\'s a match with the right-hand table. Conversely, the `RIGHT JOIN`, or `RIGHT OUTER JOIN`, returns all rows in the second table. The keyword here is *outer*, which means "preserve the whole table".\n\nIn case of a `LEFT JOIN`, if the joined field has no match in the second table, the right-hand table columns values are defaulted to `NULL`. The same rule applies for the `RIGHT JOIN`\'s unmatched rows.\n\nA `LEFT JOIN` is performed like this:\n```SQL\nSELECT move.id, move.name,\n  type.id, type.name AS type_name\nFROM move\nLEFT OUTER JOIN type ON\nmove.type_id = type.id;\n```\nBelow, there\'s a visual representation of what the output of the command should contain:\n\n![leftjoin](%3Csvg%20width%3D%22100%25%22%20height%3D%22auto%22%20viewBox%3D%220%200%20276%20202%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EGroup%204%3C%2Ftitle%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20transform%3D%22translate%2843%201%29%22%20stroke-width%3D%222%22%20stroke%3D%22%23FFF%22%3E%3Ccircle%20cx%3D%2260.5%22%20cy%3D%2260.5%22%20r%3D%2260.5%22%20fill%3D%22currentColor%22%2F%3E%3Ccircle%20cx%3D%22130.5%22%20cy%3D%2260.5%22%20r%3D%2260.5%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M138.5%2012.146C153.932%2023.109%20164%2041.129%20164%2061.5s-10.068%2038.39-25.5%2049.354C123.068%2099.891%20113%2081.871%20113%2061.5s10.068-38.39%2025.5-49.354z%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%222%22%2F%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%2274%22%20y%3D%2269%22%3EA%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%22131%22%20y%3D%2269%22%3EC%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%22190%22%20y%3D%2269%22%3EB%3C%2Ftspan%3E%3C%2Ftext%3E%3Cg%20fill%3D%22%23FFF%22%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2219%22%3E%3A%20move%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2275%22%3E%3A%20move.type_id%20%3D%20type.id%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2247%22%3E%3A%20type%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2222%22%3EA%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2278%22%3EC%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2250%22%3EB%3C%2Ftspan%3E%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E)\n\nThe first row of the 640 rows result:\n```\nid | name  | id | type_name   \n===+=======+====+==========\n1  | pound | 1  | normal\n```\nThe equivalent `RIGHT OUTER JOIN`:\n```SQL\nSELECT move.id, move.name,\n  type.id, type.name AS type_name\nFROM move\nRIGHT OUTER JOIN type ON\nmove.type_id = type.id;\n```\nYields the same first row (of 640 rows):\n```\nid | name  | id | type_name   \n===+=======+====+===========\n1  | pound | 1  | normal\n```\nConversely, the `RIGHT JOIN` representation is this:\n\n![rightjoin](%3Csvg%20width%3D%22100%25%22%20height%3D%22auto%22%20viewBox%3D%220%200%20276%20202%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EGroup%204%3C%2Ftitle%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20transform%3D%22translate%2843%201%29%22%20stroke-width%3D%222%22%20stroke%3D%22%23FFF%22%3E%3Ccircle%20cx%3D%2260.5%22%20cy%3D%2260.5%22%20r%3D%2260.5%22%2F%3E%3Ccircle%20cx%3D%22130.5%22%20cy%3D%2260.5%22%20r%3D%2260.5%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M138.5%2012.146C153.932%2023.109%20164%2041.129%20164%2061.5s-10.068%2038.39-25.5%2049.354C123.068%2099.891%20113%2081.871%20113%2061.5s10.068-38.39%2025.5-49.354z%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%222%22%2F%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%2274%22%20y%3D%2269%22%3EA%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%22131%22%20y%3D%2269%22%3EC%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%22190%22%20y%3D%2269%22%3EB%3C%2Ftspan%3E%3C%2Ftext%3E%3Cg%20fill%3D%22%23FFF%22%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2219%22%3E%3A%20move%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2275%22%3E%3A%20move.type_id%20%3D%20type.id%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2247%22%3E%3A%20type%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2222%22%3EA%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2278%22%3EC%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2250%22%3EB%3C%2Ftspan%3E%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E)\n\n\nThere shouldn\'t be any difference between the two outputs as every Pokémon, move, type or item is already in the game and `NULL` entries would probably break everything. However, if there was a move without a type in the DB (for the left join) or a type for which there are no moves (for the right join), the output would look like this:\n```\n# Left Join\nid  |        name       | id | type_name\n====+===================+====+===========\n1234| coolest-move-ever | NULL  | NULL\n\n# Right Join\nid    | name | id  | type_name   \n======+======+=====+============\nNULL  | NULL | 19  | wood\n```',
      'Sometimes, a single join might not be enough to get the desired result. In `many-to-many` relationships, when an intermediate table is used to avoid data duplication, such practice is common.\n\nIn the Pokémon database you can find multiple intermediate tables, usually named `table1_table2`: for the `pokemon` and `type` tables, the intermediate one is named `pokemon_type`. Same goes for `pokemon`, `move` and `pokemon_move`.\n\nThese are some table entries which contain only the columns relevant to the query. The `pokemon` table:\n```\nid   |   name\n=====+============\n1    |  bulbasaur\n2    |  ivysaur\n3    |  venusaur\n```\nThe `pokemon_type` table:\n```\nid   |  slot  | pokemon_id | type_id\n=====+========+============+===========\n1    |   1    |      1     |     12\n2    |   2    |      1     |     4\n3    |   1    |      2     |     12\n4    |   2    |      2     |     4\n5    |   1    |      3     |     12\n6    |   2    |      3     |     4\n```\nAnd the `type` table:\n```\nid   |  name\n=====+=========\n1    |  normal\n...\n4    |  poison\n...\n12   |  grass\n```\nThe syntax is this:\n```SQL\nSELECT pokemon.name, type.name\nFROM pokemon_type\nLEFT JOIN pokemon\nON pokemon_type.pokemon_id = pokemon.id\nLEFT JOIN type\nON pokemon_type.type_id = type.id;\n```\nThis is effectively join the first two tables (*pokemon_type* and *pokemon*) and then join the resulting table with the *type* table.\n\nThese are the first four rows of output (out of 1225):\n```\nname        | name\n============+==========\nbulbasaur   | grass\nbulbasaur   | poison\nivysaur     | grass\nivysaur     | poison\n```\nThe same result can be achieved by using subqueries.',
      '* *Successful status codes** start with the digit `2`. They inform the client that the server has received and accepted a request. Moreover, in case of a `200` **OK** status code, the result of the request will be delivered as the payload of the response.\n\nData returned depends of the method used for the request:\n- `GET` - resource requested is sent to the client\n- `HEAD` - the same header as for the `GET` request is returned\n- `POST` - entity describing or containing the result is returned\n- `TRACE` - the same message as received by the server is sent back\n\nNot all `2xx` codes, however, mean that the request has been completed. For example, the `202` **Accepted** message states that the request has been queued for processing or is still processing. Even though not mandatory, the response should contain an indication of when the user can expect the request to be completed.\n\nOther status codes indicating the **success** of a request are:\n- `204` **No Content**: successful, but no message body in the response\n- `205` **Reset Content**: tells the user agent[1] to refresh the page from which the request originated\n- `206` **Partial Content**: indicates the response is only partial',
      'The **union** of two or more tables means combining their **type-matching rows**. Unlike the `JOIN` operation, which combines columns (containing all entries from either the left, the right or both tables), the `UNION` operation always retrieves every entry in *both tables*.\n\nHowever, there are two necessary conditions for a `UNION` to be performed:\n    - each union query must have the same number of columns\n    - every *nth* column must have the same type in all union queries\n\nFor example, the following union will fail:\n```SQL\nSELECT *\nFROM language\nUNION\nSELECT *\nFROM language_name;\n/* ERROR:  each UNION query must have\n the same number of columns\n LINE 4: SELECT *  */\n\n```\nAs well as the next one:\n```SQL\nSELECT id, name\nFROM language\nUNION\nSELECT id, language_id\nfrom language_name;\n/* ERROR:  UNION types text and bigint\n cannot be matched\n LINE 4: SELECT id, language_id   */\n```\nChanging `language_id` to `name` fixes the errors:\n```SQL\nSELECT id, name\nFROM language\nUNION\nSELECT id, name\nfrom language_name;\n```\nWith the output:\n```\nid |       name       \n===+============\n16 | Chinese\n35 | Englisch\n 2 | roomaji\n29 | 伊語\n9  | en\n26 | Espagnol\n\n(51 rows)\n```\n\n### UNION ALL\n\nBy default, `UNION` returns only **distinct** values. If you need all occurrences of the items, use `UNION ALL`. In the above example, the tables won\'t contain any duplicates: if we were to change the last query to include the `ALL` keyword, the number of total rows will stay the same:\n```SQL\nSELECT id, name\nFROM language\nUNION ALL\nSELECT id, name\nfrom language_name;\n```\nAnd the output:\n```\nid  |       name       \n====+============\n  1 | ja\n  2 | roomaji\n  3 | ko\n  4 | zh\n  5 | fr\n  6 | de\n  7 | es\n  8 | it\n  9 | en\n(51 rows)\n```\n\nFor tables where data singularity is not always the case, the results might be different. An immediate consequence of this is that `UNION` performs worse, as it must scan the result for duplicates.',
      'Virtually every Unix system comes with the `curl` command pre-installed.  `curl` allows us to simulate any HTTP request, although most commonly it\'s used to download files and webpages from the command-line.\n\nHere\'s a quick example:\n\n```console\n$ curl http://google.com\n<HTML><HEAD>\n<TITLE>301 Moved</TITLE></HEAD><BODY>\n<H1>301 Moved</H1>\nThe document has moved\n<A HREF="http://www.google.com/">here</A>.\n</BODY></HTML>\n$\n```\n\nHere, `curl` is fetching the contents of `http://google.com` and printing out whatever we receive in response.  In this case, we receive an HTML document telling us go to `http://www.google.com` instead.  A normal browser would follow this redirect automatically, so as a user we\'d never see this page.\n\nIf we ask `curl` to fetch something other than text it will still try to print out its contents to the console, resulting in gibberish.\n\n### Saving Output From `curl`\n\nThere are two main ways to save the output from curl: using `>` redirection or using the `-o` option.\n\n```console\n$ curl http://foo.com/bar.mp3 > song.mp3\n$ curl -o song.mp3 http://foo.com/bar.mp3\n```\n\nBoth of these will result in `curl` downloading `bar.mp3` and writing it to the `song.mp3` file in the current directory.',
      'The `ping` command will continuously send a tiny bit of internet traffic to a remote address and report the amount of time it took to receive a response.  It will also report if the traffic was dropped, which is indicative of a bad network connection or a misconfigured network. The `ping` command one of the most basic and essential tools for diagnosing network problems.\n\nHere is an example:\n\n```console\n$ ping google.com\nPING google.com (172.217.0.238)\n  56(84) bytes of data.\n64 bytes from 172.217.0.238:\n  icmp_seq=1 ttl=56 time=0.849 ms\n64 bytes from 172.217.0.238:\n  icmp_seq=2 ttl=56 time=0.822 ms\n64 bytes from 172.217.0.238:\n  icmp_seq=3 ttl=56 time=0.905 ms\n64 bytes from 172.217.0.238:\n  icmp_seq=4 ttl=56 time=0.894 ms\n64 bytes from 172.217.0.238:\n  icmp_seq=5 ttl=56 time=0.888 ms\n=== google.com ping statistics ===\n5 packets transmitted, 5 received,\n  0% packet loss, time 4001ms\nrtt min/avg/max/mdev =\n  0.822/0.871/0.905/0.044 ms\n$\n```\n\nThe `ping` command will continue to do this until it is stopped.  The `time=` field is the most important.  This particular machine is getting a response back from `google.com` in about 1 millisecond, which is very fparser.  `ping` will also give an overall summary of the "ping session", which includes the number of ping packets sent, the percentage of packets lost, and various statistics about the round trip time (`rtt`).\n\nKeep in mind that latency has to do with both the quality of your connection and the physical distance between the machine on which you issue the `ping` command and the machine being pinged.\n\nFor example, if I ping `www.duma.ru`, the website for the Russian State Parliament (Duma), we get much higher ping times:\n\n```console\n$ ping duma.ru\nPING duma.ru (212.11.128.31)\n  56(84) bytes of data.\n64 bytes from duma.ru (212.11.128.31):\n  icmp_seq=1 ttl=113 time=149 ms\n64 bytes from duma.ru (212.11.128.31):\n  icmp_seq=2 ttl=113 time=149 ms\n64 bytes from duma.ru (212.11.128.31):\n  icmp_seq=3 ttl=113 time=149 ms\n64 bytes from duma.ru (212.11.128.31):\n  icmp_seq=4 ttl=113 time=149 ms\n=== duma.ru ping statistics ===\n5 packets transmitted, 4 received,\n  20% packet loss, time 4005ms\nrtt min/avg/max/mdev =\n  149.660/149.811/149.946/0.484 ms\n$\n```',
      'In git you can tag a certain point in history as being important. You can use this to mark a new **version**.\n\nYou can create an **annotated** tag by:\n```\n$ git tag -a v1.0.1 -m "Version 1.0.1"\n```\nAnnotated tags contain useful information: the current commit checksum, your name and email, the date and the tagging message.\n\nYou can also create a **lightweight** tag which acts just as a pointer to the current commit:\n```\n$ git tag v1.0.l\n```\nYou can add a tag to an **older** commit by specifying part of its commit checksum, for example:\n```\n$ git tag -a v.1.0.0 4682c32\n```\n\nYou can list all the tags you have made in **alphabetical** order:\n```\n$ git tag\nv0.1\nv0.9\nv1.5\n```\nIf your project has hundreds of tags, you can also search for **specific** tags, for example those of version `v1.0`:\n```\ngit tag -l "v1.0*"\nv1.0.0\nv1.0.1\nv1.0.2\nv1.0.3\n```'
    ].map(content => content.replace(/\n/, '').replace(/ /, ''))
    const contentArr = testInsights.map(insight => insight.getContent()).filter(Boolean)
    contentArr.forEach(content => {
      expect(possibleContents).toContain(content.replace(/\n/, '').replace(/ /, ''))
    })
  })

  test('parses the content section from the raw insight text with image', () => {
    testInsights.forEach(insight => {
      const content = insight.getContent()
      expect(content).toBeDefined()
      expect(content.length).toBeGreaterThan(0)
    })

    // const contentArr = testInsights.map(insight => insight.getContent() )

    // expect(contentArr).toEqual(expect.arrayContaining([
    //   'The __Open Systems Interconnection Model__ (OSI Model) is a model for standardizing networks across various hardware configurations.![alt description](%3Csvg%20viewBox%3D%22-78%20-46%20476%20560%22%20width%3D%22476%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20height%3D%22560%22%3E%3Cdefs%3E%3Cpath%20id%3D%22a%22%20d%3D%22M-3.56%20225l-.23-4.08-.84-3.93-1.31-3.23-1.62-2.93-2.16-2.46-2.3-2-2.7-1.16-3-.38%203-.24%202.7-1.23%202.3-1.69%202.16-2.7%201.62-3%201.3-3.23.85-3.85.23-4.24%22%20stroke%3D%22%23fff%22%20fill%3D%22%23fff%22%2F%3E%3Cpath%20id%3D%22b%22%20fill%3D%22none%22%20stroke%3D%22%237c7c7c%22%20d%3D%22M-3.56%20225l-.23-4.08-.84-3.93-1.31-3.23-1.62-2.93-2.16-2.46-2.3-2-2.7-1.16-3-.38%203-.24%202.7-1.23%202.3-1.69%202.16-2.7%201.62-3%201.3-3.23.85-3.85.23-4.24%22%2F%3E%3C%2Fdefs%3E%3Crect%20height%3D%22100%25%22%20width98%22%20font-size%3D%2210pt%22%20dy%3D%2216%22%3EPath%20Determination%20and%3C%2Ftspan%3E%20%3Ctspan%20x%3D%22248.98%22%20font-size%3D%2210pt%22%20dy%3D%2216%22%3ELogical%20Addressing%20%28IP%29%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20y%3D%22369%22%20x%3D%22249.04%22%3E%3Ctspan%3EData%20Link%3C%2Ftspan%3E%20%3Ctspan%20x%3D%22248.98%22%20font-size%3D%2210pt%22%20dy%3D%2216%22%3EPhysical%20Addressing%3C%2Ftspan%3E%20%3Ctspan%20x%3D%22248.98%22%20font-size%3D%2210pt%22%20dy%3D%2216%22%3E%28MAC%20and%20LLC%29%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20y%3D%22435%22%20x%3D%22249.04%22%3E%3Ctspan%3EPhysical%3C%2Ftspan%3E%20%3Ctspan%20x%3D%22248.98%22%20font-size%3D%2210pt%22%20dy%3D%2216%22%3EMedia%2C%20Signal%20and%3C%2Ftspan%3E%20%3Ctspan%20x%3D%22248.98%22%20font-size%3D%2210pt%22%20dy%3D%2216%22%3EBinary%20Transmission%3C%2Ftspan%3E%3C%2Ftext%3E%3Cg%20font-size%3D%2224.06%22%3E%3Ctext%20y%3D%22127%22%20x%3D%22-50%22%20transform%3D%22rotate%28-90%20-50%20127%29%22%3EHost%20Layers%3C%2Ftext%3E%3Ctext%20y%3D%22384%22%20x%3D%22-50%22%20transform%3D%22rotate%28-90%20-50%20384%29%22%3EMedia%20Layers%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fswitch%3E%3C%2Fsvg%3E)',
    //   'The `LEFT JOIN`, or `LEFT OUTER JOIN`, is a type of join whose result contains **all** rows in the first table, regardless of whether there\'s a match with the right-hand table. Conversely, the `RIGHT JOIN`, or `RIGHT OUTER JOIN`, returns all rows in the second table. The keyword here is *outer*, which means "preserve the whole table".\n\nIn case of a `LEFT JOIN`, if the joined field has no match in the second table, the right-hand table columns values are defaulted to `NULL`. The same rule applies for the `RIGHT JOIN`\'s unmatched rows.\n\nA `LEFT JOIN` is performed like this:\n```SQL\nSELECT move.id, move.name,\n  type.id, type.name AS type_name\nFROM move\nLEFT OUTER JOIN type ON\nmove.type_id = type.id;\n```\nBelow, there\'s a visual representation of what the output of the command should contain:\n\n![leftjoin](%3Csvg%20width%3D%22100%25%22%20height%3D%22auto%22%20viewBox%3D%220%200%20276%20202%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EGroup%204%3C%2Ftitle%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20transform%3D%22translate%2843%201%29%22%20stroke-width%3D%222%22%20stroke%3D%22%23FFF%22%3E%3Ccircle%20cx%3D%2260.5%22%20cy%3D%2260.5%22%20r%3D%2260.5%22%20fill%3D%22currentColor%22%2F%3E%3Ccircle%20cx%3D%22130.5%22%20cy%3D%2260.5%22%20r%3D%2260.5%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M138.5%2012.146C153.932%2023.109%20164%2041.129%20164%2061.5s-10.068%2038.39-25.5%2049.354C123.068%2099.891%20113%2081.871%20113%2061.5s10.068-38.39%2025.5-49.354z%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%222%22%2F%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%2274%22%20y%3D%2269%22%3EA%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%22131%22%20y%3D%2269%22%3EC%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%22190%22%20y%3D%2269%22%3EB%3C%2Ftspan%3E%3C%2Ftext%3E%3Cg%20fill%3D%22%23FFF%22%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2219%22%3E%3A%20move%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2275%22%3E%3A%20move.type_id%20%3D%20type.id%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2247%22%3E%3A%20type%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2222%22%3EA%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2278%22%3EC%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2250%22%3EB%3C%2Ftspan%3E%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E)\n\nThe first row of the 640 rows result:\n```\nid | name  | id | type_name   \n===+=======+====+==========\n1  | pound | 1  | normal\n```\nThe equivalent `RIGHT OUTER JOIN`:\n```SQL\nSELECT move.id, move.name,\n  type.id, type.name AS type_name\nFROM move\nRIGHT OUTER JOIN type ON\nmove.type_id = type.id;\n```\nYields the same first row (of 640 rows):\n```\nid | name  | id | type_name   \n===+=======+====+===========\n1  | pound | 1  | normal\n```\nConversely, the `RIGHT JOIN` representation is this:\n\n![rightjoin](%3Csvg%20width%3D%22100%25%22%20height%3D%22auto%22%20viewBox%3D%220%200%20276%20202%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ctitle%3EGroup%204%3C%2Ftitle%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20transform%3D%22translate%2843%201%29%22%20stroke-width%3D%222%22%20stroke%3D%22%23FFF%22%3E%3Ccircle%20cx%3D%2260.5%22%20cy%3D%2260.5%22%20r%3D%2260.5%22%2F%3E%3Ccircle%20cx%3D%22130.5%22%20cy%3D%2260.5%22%20r%3D%2260.5%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fg%3E%3Cpath%20d%3D%22M138.5%2012.146C153.932%2023.109%20164%2041.129%20164%2061.5s-10.068%2038.39-25.5%2049.354C123.068%2099.891%20113%2081.871%20113%2061.5s10.068-38.39%2025.5-49.354z%22%20stroke%3D%22%23FFF%22%20stroke-width%3D%222%22%2F%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%2274%22%20y%3D%2269%22%3EA%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%22131%22%20y%3D%2269%22%3EC%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20fill%3D%22%23FFF%22%20transform%3D%22translate%280%201%29%22%3E%3Ctspan%20x%3D%22190%22%20y%3D%2269%22%3EB%3C%2Ftspan%3E%3C%2Ftext%3E%3Cg%20fill%3D%22%23FFF%22%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2219%22%3E%3A%20move%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2275%22%3E%3A%20move.type_id%20%3D%20type.id%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Light%2C%20Roboto%22%20font-size%3D%2215.5%22%20font-weight%3D%22300%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%2219%22%20y%3D%2247%22%3E%3A%20type%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2222%22%3EA%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2278%22%3EC%3C%2Ftspan%3E%3C%2Ftext%3E%3Ctext%20font-family%3D%22Roboto-Regular%2C%20Roboto%22%20font-size%3D%2224%22%20transform%3D%22translate%280%20123%29%22%3E%3Ctspan%20x%3D%220%22%20y%3D%2250%22%3EB%3C%2Ftspan%3E%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E)\n\n\nThere shouldn\'t be any difference between the two outputs as every Pokémon, move, type or item is already in the game and `NULL` entries would probably break everything. However, if there was a move without a type in the DB (for the left join) or a type for which there are no moves (for the right join), the output would look like this:\n```\n# Left Join\nid  |        name       | id | type_name\n====+===================+====+===========\n1234| coolest-move-ever | NULL  | NULL\n\n# Right Join\nid    | name | id  | type_name   \n======+======+=====+============\nNULL  | NULL | 19  | wood\n```'
    // ]))
  })

  test('parses the Practice Question question', () => {
    const possibleQuestions = [
      '`ping` will send ??? and count the time until the\n\n???.',
      'Add a `v1.0` annotated tag to the commit `ac32b10`.\n```\n$ git ??? ??? ??? ac32b10\n```',
      'What would the following snippet print?\n```\nfunction mult(x, y){\n  var z = x * x;\n}\n\nconsole.log(mult(2,3));\n???\n```',
      'What is the OSI 7 Layer Model?\n???',
      'Complete the second code snippet such that it\'s equivalent to the first:\nFirst:\n```jsx\nclass Test extend React.Component {\n  render() {\n    return <h1>{this.props.test}\n  }\n}\n```\nSecond:\n```jsx\n??? Test(???) {\n  ??? <p>???</p>;\n}\n```',
      'The difference between inner join (IJ) and left outer join (LOJ) is that\n???\n* the LOJ result contains all rows in the first table\n* the LOJ result contains all rows in the second table\n* only their name differ\n* tables intersection can only be found as part of IJ result\n',
      'Obtain the list of moves a Pokémon learns ordered by game version and level at which it learns the move:\n```SQL\nSELECT pokemon.name,\n  poke_move_level.level,\n  poke_move_level.name,\n  poke_move_level.version_group_id\n??? pokemon\n??? (SELECT *\nFROM pokemon_move\nLEFT JOIN move ???\npokemon_move.move_id = move.id)\n??? poke_move_level\nON pokemon.id =\n  poke_move_level.pokemon_id\nORDER BY pokemon.id,\n  LJoinRes.version_group_id,\n  LJoinRes.level;\n```',
      'What other name does the **staging area** have?\n\n???',
      'A `200` response to a `GET` request contains\n\n??? as payload.',
      'Retrieve the `UNION` of the `region` and `region_name` tables:\n\n```SQL\nSELECT name\n??? region\n???\nSELECT ???\nFROM ???\nWHERE region_name.region_id = 2;\n```'
    ].map(question => question.replace(/\n/, ''))

    const practiceQuestionTextArr = testInsights
      .map(insight => insight.getPracticeQuestion())
      // Remove insights where practice question does not exist
      .filter(Boolean)

    practiceQuestionTextArr.forEach(({text, rawText}) => {
      expect(text.length).toBeGreaterThan(0)
      expect(rawText.length).toBeGreaterThan(0)
      expect(possibleQuestions).toContain(text)
    })
  })

  test('parses the Practice Question answers', () => {
    const possibleAnswers = flatten([
      ['a flexible standard for various network configurations', 'a hard standard for various network configurations', 'a flexible standard for various hardware component configurations', 'a hard standard for various hardware component configurations'],
      ['the LOJ result contains all rows in the first table', 'the LOJ result contains all rows in the second table', 'only their name differ', 'tables intersection can only be found as part of IJ result'],
      ['`FROM`', '`RIGHT OUTER JOIN`', '`ON`', '`AS`', '`pokemon`', '`OUTER JOIN`', '`SELECT`', '`ORDER BY`'],
      ['the resource requested', 'the new entity created', 'the HTTP version', 'the same initial headers'],
      ['`FROM`', '`UNION`', '`name`', '`region_name`', '`ON`', '`OUTER JOIN`', '`*`'],
      ['`undefined`', '`4`', '`9`', '`6`', '`error`'],
      ['`function`', '`props`', '`return`', '`{props.test}`', '`{this.props.test}`', '`render`', '`state`', '`func`', '`props.test`', '`test`', '`this.props.test`'],
      ['index', 'HEAD', 'tag', 'stage'],
      ['data', 'server’s response', 'connection fails', 'your public key'],
      ['`tag`', '`-a`', '`v1.0`', '`-t`', '`-m`', '`commit`']
    ])
    const practiceQuestionTextArr = testInsights
      .map(insight => insight.getPracticeQuestion())
      // Remove insights where practice question does not exist
      .filter(Boolean)
    practiceQuestionTextArr.forEach(({answers}) => {
      expect(answers).toBeArray()
      expect(answers.length).toBeGreaterThan(0)
      answers.forEach(answer => {
        expect(typeof answer).toBe('string')
      })

      expect(possibleAnswers).toIncludeAllMembers(answers)
    })
  })

  test('parses the Revision Question question', () => {
    const revisionQuestionArr = testInsights
      .map(insight => insight.getRevisionQuestion())
      .filter(Boolean)
      .map(revisionQuestion => revisionQuestion.text)
    revisionQuestionArr.forEach(revisionQuestion => {
      expect(revisionQuestion).toHaveProperty('rawText')
      expect(revisionQuestion).toHaveProperty('text')
      expect(revisionQuestion).toHaveProperty('answers')
      expect(revisionQuestion.text.length).toBeGreaterThan(0)
      expect(revisionQuestion.answers.length).toBeGreaterThan(0)
      revisionQuestion.answers.forEach(answer => {
        expect(typeof answer).toBe('string')
      })
    })

    expect(revisionQuestionArr).toEqual(expect.arrayContaining([
      'What would the following snippet print?\n```\nfunction add(x, y){\n  var sum = x + y;\n}\n\nconsole.log(add(2,3));\n???\n```',
      'When can a component be written as a `function`?\n\nWhen it has ???.',
      'The syntax for declaring an IIFE function is:\n```\n(???{\n // code\n})???;\n```',
      'The OSI 7 Layer Model is ordered, from bottom to top, in the following order:\n\n1. ???\n2. ???\n3. ???\n4. ???\n5. ???\n6. ???\n7. ???',
      'Complete the following snippet such that the command is a valid `RIGHT JOIN`:\n```SQL\nSELECT *\n??? type\n??? type_efficacy ???\ntype.id = type_efficacy.target_type_id;\n```',
      'Is the following statement true or false?\n\nIn order to join multiple tables together, subqueries must be used.\n\n???',
      'What is the format of status codes indicating the **success** of a request?\n\n???',
      '??? command retrieves all rows, `even duplicated`, of the union.',
      'Complete the following command line snippet to download the picture:\n```\n$ ??? ??? ???\n         https://catpictures.com/cat1.jpg\n```',
      'Based on the distance, which server would respond to pings faster?\n\n???',
      'Complete the command to retrieve all tags that are part of `v2`:\n```\n$ git tag ??? ???\n```'
    ]))
  })

  test('parses the Revision Question answers', () => {
    const revisionQuestionHavingInsights = testInsights.filter(insight => {
      return insight.slug !== 'external-configuration-files'
    })

    revisionQuestionHavingInsights.forEach(insight => {
      expect(insight.getRevisionQuestion()).toBeDefined()
    })

    const revisionQuestionArr = revisionQuestionHavingInsights.map(insight => insight.revisionQuestion.answers)

    expect(revisionQuestionArr).toEqual(expect.arrayContaining([
      [ '`undefined`',
        '`5`',
        '`false`',
        '`error`' ],
      [ 'no `state` and **lifecycle methods**',
        'no `state`',
        'no **lifecycle methods**',
        'no `props`' ],
      [ '`function()`',
        '`()`',
        '`functionName()`',
        '`{}`',
        '`apply`' ],
      [ 'Physical Layer',
        'Data Link Layer',
        'Network Layer',
        'Transport Layer',
        'Session Layer',
        'Presentation Layer',
        'Application Layer' ],
      [ '`FROM`',
        '`RIGHT JOIN`',
        '`ON`',
        '`LEFT JOIN`',
        '`WHERE`' ],
      [ 'false',
        'true' ],
      [ '`2xx`',
        '`1xx`',
        '`3xx`' ],
      [ '`UNION ALL`',
        '`UNION`',
        '`JOIN`',
        '`SELECT`' ],
      [ '`curl`',
        '`-o`',
        '`cat.jpg`',
        '`-O`',
        '`-d`' ],
      [ 'a close one',
        'a distant one',
        'the distance isn’t relevant' ],
      [ '`-l`',
        '`v2*`',
        '`2`',
        '`-m`' ]
    ]))
  })

  test('captures all fields defined in the yaml section', () => {
    testInsights.forEach(insight => {
      const metadata = insight.getMetadata()
      expect(metadata).toHaveProperty('author')
      expect(metadata).toHaveProperty('levels')
      expect(metadata).toHaveProperty('type')
      expect(metadata).toHaveProperty('category')
    })
  })

  test('renders footnotes properly', () => {
    testInsights.forEach(insight => {
      // Render as AST and compare values
      let astInsight = parser.parse(insight.render())
      let astFootnotes

      visit(astInsight, function (node, index, parent) {
        if (node.name === 'Footnotes') {
          astFootnotes = astInsight.nodes[0].value
        }
      })

      if (astFootnotes == null) return
      expect(astFootnotes
        .replace(/\n\n*/g, '\n')
      ).toBe(insight.footnotes
        .replace(/\n\n*/g, '\n')
      )
    })
  })
})
