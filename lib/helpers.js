/*
 * Helpers for various tasks
 *  
**/

// Dependencies
var crypto = require('crypto');
var config = require('../config');
var https = require('https');
var querystring = require('querystring');

// Container for all the helpers
var helpers = {};

// Create a SHA256 hash
helpers.hash = function (str) {
  if (typeof (str) == 'string' && str.length > 0) {
    var hash = crypto.createHash('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parse a JSON string to an object ib all cases, without throwing
helpers.parseJsonToObject = function (str) {
  try {
    var obj = JSON.parse(str)
    return obj
  } catch (e) {
    return {}
  }
};


// Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = function (strLength) {
  strLength = typeof (strLength) == 'number' && strLength > 0 ? strLength : false;
  if (strLength) {
    // Define all possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for (var i = 1; i <= strLength; i++) {
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
}


// Send an SMS message via Twilio
helpers.sendTwilioSms = function (phone, msg, callback) {
  // Validate parameters
  phone = typeof (string) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
  msg = typeof (string) == 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? msg.trim() : false;

  if (phone && msg) {
    // Configure the request payload
    var payload = {
      'From': config.twilio.fromPhone,
      'To': '+1' + phone,
      'Body': msg
    };

    // Stringify the payload
    var stringPayload = querystring.stringify(payload);

    // Configure the request details
    var requestDetails = {
      'protocol': 'https',
      'hostname': 'api.twilio.com',
      'method': 'POST',
      'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
      'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
      'header': {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    var req = https.request(requestDetails, function (res) {
      // Grab the status of the sent request
      var status = res.statusCode;
    });

  } else {
    callback('Given parameters were missing or invalid');
  }
};



// Export the module
module.exports = helpers;