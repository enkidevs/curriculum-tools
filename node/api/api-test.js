'use strict';

const path 		= require('path');
const fs 		= require('fs');
const Insight 	= require('./insight');
const filePath 	= path.join(__dirname,process.argv[2]);


fs.readFile(filePath, 'utf-8', function(err, data) {
	var testboy = new Insight(data);
	console.log(testboy);
});
