var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;


var server = http.createServer(function(req, res) {
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
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function() {
        buffer += decoder.end();

        // choose the handler or notFound
        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // data obj to handler
        var data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'payload': buffer
        }

        // route the request to the handler
        chosenHandler(data, function(statusCode, payload) {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

            payload = typeof (payload) == 'object' ? payload : {};

            var payloadString = JSON.stringify(payload);

            // send the response
            res.writeHead(statusCode);
            res.end(payloadString);

            // log the request path
            console.log('response', statusCode, payloadString);
        });
    });

});


server.listen(3000, function() {
    console.log('listening on 3000...');
});

// define the hendlers
var handlers = {};

// sample handler
handlers.sample = function(data, callback) {
    // callback http status code and payload
    callback(406, { 'name': 'sample handler' });
}

// not found handler
handlers.notFound = function(data, callback) {
    callback(404);
}

// define a request router
var router = {
    'sample': handlers.sample
}



