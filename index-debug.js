/*
* Primary file to the API
*
**/

// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');
var exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

// Declare the app
var app = {};

// Init function
app.init = function () {
	// Start the server
	debugger;
	server.init();
	debugger;
	// Start the workers
	// workers.init();
	debugger;
	// STart the CLI (starts last)
	setTimeout(function () {
		cli.init();
		debugger;
	}, 500);
	debugger;

	debugger;
	// Set foo at 1
	var foo = 1;
	debugger;
	// Increment foo
	foo++;
	debugger;
	// Square foo
	foo = foo * foo;
	debugger;
	// Convert foo to String
	foo = foo.toString();
	debugger;
	// Call the init script that will throw
	exampleDebuggingProblem.init();
	debugger;
};

// Execute
app.init();

// Export the app
module.export = app;
