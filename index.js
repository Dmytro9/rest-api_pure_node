/*
* Primary file to the API
*
**/

// Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var cli = require('./lib/cli');

// Declare the app
var app = {};

// Init function
app.init = function () {
	// Start the server
	server.init();

	// Start the workers
	// workers.init();

	// STart the CLI (starts last)
	setTimeout(function () {
		cli.init();
	}, 500);
};

// Execute
app.init();

// Export the app
module.export = app;
