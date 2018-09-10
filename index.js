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

        // send the response
        res.end('Hello World\n');

        // log the request path
        console.log('payload', buffer);
    });

});


server.listen(3000, function() {
    console.log('listening on 3000...');
});
