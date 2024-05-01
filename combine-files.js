#!/usr/bin/env node
// Modified version of https://www.npmjs.com/package/combine-files altered to support recursion
const fs = require('fs');
let files = process.argv[2];
const output = process.argv[3];
let separator = process.argv[4];

function combineFiles(files, output, separator) {

	if (files == '.') {
		files = fs.readdirSync('.');
		
		if (files.indexOf('combine-files.js') >= 0) {
			files.splice(files.indexOf('combine-files.js'), 1);
		}

	} else if (files.slice(-1) === '/') {
	path = files;
	files = [];
	traverse(path, files);
	} else if (files.indexOf(',') > 0) {
		files = files.split(',');
	}

	if (!separator) {
		separator = '';
	}

	separator = separator.replace(/\\n/g, '\n');
	separator = separator.replace(/\\r/g, '\r');

	let finalFile = '';

	files.forEach(function(file) {
		if (!fs.lstatSync(file).isDirectory()) {
			finalFile += fs.readFileSync(file, 'utf8') + separator;
		}
	});

	fs.writeFile(output, finalFile, 'utf8', function(err) {
		if (err) return console.log(err);
	});
}

function traverse(path, files) {
	dirContent = fs.readdirSync(path, {withFileTypes: true});
	let textFiles = [];
	let dirs = [];
	dirContent.forEach((f) => {
		if (f.isFile()) files.push(path+f.name)
		else if (f.isDirectory()) traverse(path+f.name+'/',files);
	});
}

if (output) {
	combineFiles(files, output, separator);
}

module.exports = combineFiles;