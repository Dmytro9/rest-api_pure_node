/*
 * Example UDP Server
 * Creating a UDP datagram server listening on 7000
 * (udp - protocol wich guarantees that information sent is received, used often for video stream or else sending)
 *  
 */

// Dependencies
var dgram = require('dgram');

// Create a server
var server = dgram.createSocket('udp4');

server.on('message', function (messageBuffer, sender) {
    // Do something with an incoming message or do something with the sender
    var messageString = messageBuffer.toString();
    console.log(messageString);
});

// Bind to 7000
server.bind(7000);
