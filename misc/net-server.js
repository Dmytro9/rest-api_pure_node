/*
 * Example TCP (Net) Server
 * Listen to port 7000 and sends the word "pong" to client
 *
 */

// Dependencies
var net = require("net");

// Create a server
var server = net.createServer(function(connection) {
  // Send the word "pong"
  var outboundMessage = "pong";
  connection.write(outboundMessage);

  // When the client writes something, log it out
  connection.on("data", function(inboundMessage) {
    var messageString = inboundMessage.toString();
    console.log(
      "I wrote " + outboundMessage + " and they said " + messageString
    );
  });
});

// Listen to 7000
server.listen(7000);
