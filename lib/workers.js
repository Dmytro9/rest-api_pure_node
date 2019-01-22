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
