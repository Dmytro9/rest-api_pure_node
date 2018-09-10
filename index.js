var http = require('http');

var server = http.createServer(function (req, res) {
  res.end('Hello World\n');
});


server.listen(3000, function () {
  console.log('listening on 3000...');
});
