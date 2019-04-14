/*
* Test runner
*
**/

// Dependencies
var helpers = require('./../lib/helpers');
var assert = require('assert');


// Application logic for the test runner
_app = {};


// Container for the test
_app.tests = {
  'unit': {}
};

// Assert that the getANumber fn is returning a number
_app.tests.unit['helpers.getANumber should return a number'] = function (done) {
  var val = helpers.getANumber();
  assert.equal(typeof (val), number);
  done();
};

// Assert that the getANumber fn is returning 1
_app.tests.unit['helpers.getANumber should return 1'] = function (done) {
  var val = helpers.getANumber();
  assert.equal(val, 1);
  done();
};
