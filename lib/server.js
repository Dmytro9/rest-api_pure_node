/*
* Server related tasks
*
**/

var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var fs = require('fs');
var config = require('./config');
var handlers = require('./handlers');
var helpers = require('./helpers');
var path = require('path');

// Initialization request to Twilio API 
// helpers.sendTwilioSms('[myPhoneNumber]', 'Hello!', function (err) {
// 	console.log('this was the error ', err);
// });

// Instanciate the server module object
var server = {};


// Instantiating http server 
server.httpServer = http.createServer(function (req, res) {
  server.unifiedServer(req, res);
});


// Instantiating https server 
server.httpsServerOptions = {
  'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
  'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function (req, res) {
  unifiedServer(req, res);
});


// All the server logic for both the http and https createServer
server.unifiedServer = function (req, res) {

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
    var chosenHandler = typeof (server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
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
server.router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks,
  'notFound': handlers.notFound,
}

// Init script
server.init = function () {
  // Start the HTTP server
  server.httpServer.listen(config.httpPort, function () {
    console.log('Server is listening on ' + config.httpPort + ' port in ' + config.envName + ' mode ...');
  });
  // Start the HTTPS server
  server.httpsServer.listen(config.httpsPort, function () {
    console.log('Server is listening on ' + config.httpsPort + ' port in ' + config.envName + ' mode ...');
  });
};

// Export the module
module.exports = server; 
