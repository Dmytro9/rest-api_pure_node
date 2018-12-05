var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');
var config = require('./config');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');


// Instantiating http server 
var httpServer = http.createServer(function (req, res) {
	unifiedServer(req, res);
});

// Start the HTTP server
httpServer.listen(config.httpPort, function () {
	console.log('Server is listening on ' + config.httpPort + ' port in ' + config.envName + ' mode ...');
});

// Instantiating https server 
var httpsServerOptions = {
	'key': fs.readFileSync('./https/key.pem'),
	'cert': fs.readFileSync('./https/cert.pem')
};
var httpsServer = https.createServer(httpsServerOptions, function (req, res) {
	unifiedServer(req, res);
});

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function () {
	console.log('Server is listening on ' + config.httpsPort + ' port in ' + config.envName + ' mode ...');
});


// All the server logic for both the http and https createServer
var unifiedServer = function (req, res) {

	// parse url
	var parseUrl = url.parse(req.url, true);

	// get the path
	var path = parseUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g, '');

	// get query string
	var queryStringObject = parseUrl.query;

	// get the headers
	var headers = req.headers;

	// get http method
	var method = req.method.toLocaleLowerCase();

	// get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data', function (data) {
		buffer += decoder.write(data);
	});
	req.on('end', function () {
		buffer += decoder.end();

		// choose the handler or notFound
		var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
		// data obj to handler
		var data = {
			'trimmedPath': trimmedPath,
			'queryStringObject': queryStringObject,
			'method': method,
			'payload': helpers.parseJsonToObject(buffer),
			'headers': headers
		}

		// route the request to the handler
		chosenHandler(data, function (statusCode, payload) {
			statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

			payload = typeof (payload) == 'object' ? payload : {};

			var payloadString = JSON.stringify(payload);

			// send the response
			res.setHeader('Content-Type', 'application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			// log the request path
			console.log('response', statusCode, payloadString);
		});
	});
}


// define a request router
var router = {
	'ping': handlers.ping,
	'users': handlers.users,
	'tokens': handlers.tokens
}
