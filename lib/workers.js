/*
* Worker-related tasks
*
**/

// Dependencies
var path = require('path');
var fs = require('fs');
var _data = require('./data');
var http = require('http');
var https = require('https');
var helpers = require('./helpers');
var url = require('url');


// Instantiate the worker object
var workers = {};


// Lookup all checks, get their data, send to a validator
workers.gatherAllChecks = function () {
  // Get all the checks
  _data.list('checks', function (err, checks) {
    if (!err && checks && checks.length > 0) {
      checks.forEach(function (check) {
        // Read in the check data
        _data.read('checks', check, function (err, originalCheckData) {
          if (!err && originalCheckData) {
            // Pass it to the check validator, and let that function continue or log err
            workers.validateCheckData(originalCheckData);
          } else {
            console.log("Error reading one of the checks data");
          }
        });
      });
    } else {
      console.log("Error: Could not find any checks to process");
    }
  });
};


// Sanity-check the check-data
workers.validateCheckData = function (originalCheckData) {
  originalCheckData = typeof (originalCheckData) = 'object' && originalCheckData != null ? originalCheckData : {}
  originalCheckData.id = typeof (originalCheckData.id) == 'string' && originalCheckData.id.length == 20 ? originalCheckData.id.trim() : false;
  originalCheckData.userPhone = typeof (originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.length == 10 ? originalCheckData.userPhone.trim() : false;
  originalCheckData.ptotocol = typeof (originalCheckData.ptotocol) == 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
  originalCheckData.url = typeof (originalCheckData.url) == 'string' && originalCheckData.url.length > 0 ? originalCheckData.url.trim() : false;
  originalCheckData.method = typeof (originalCheckData.method) == 'string' && ['put', 'post', 'get', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
  originalCheckData.successCodes = typeof (originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
  originalCheckData.timeoutSeconds = typeof (originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

  // Set the keys that may not be set (if the workers have never seen this check before)
  originalCheckData.state = typeof (originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
  originalCheckData.lastChecked = typeof (originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

  // If all the checks pass, pass the data along to the next step in the process
  if (originalCheckData.id && originalCheckData.userPhone && originalCheckData.protocol && originalCheckData.url && originalCheckData.method && originalCheckData.successCodes && originalCheckData.timeoutSeconds) {
    workers.performCheck(originalCheckData);
  } else {
    console.log('Error: one of the checks is not properly formatted. Skipping it.');
  }
};

// Perfrom the check, send the originalCheckData and the outcome of the check process, to the next step of the process


// Timer to execute the worker-process once per minute
workers.loop = function () {
  setInterval(function () {
    workers.gatherAllChecks();
  }, 1000 * 60);
};

// Init script
workers.init = function () {
  // Execute all the checks immediately
  workers.gatherAllChecks();
  // Call the loop so the check will execute later on
  workers.loop();
};


// Export the module
module.export = workers;
