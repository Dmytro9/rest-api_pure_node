/*
 * Request handlers
 * 
**/

// Dependencies
var _data = require('./data');
var helpers = require('./helpers');


// define the handlers
var handlers = {};

// users handler
handlers.users = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};


// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
  // check all data required are filled out
  var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  var tosAgreement = typeof (data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? data.payload.tosAgreement : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure thst user doesnt already exist
    _data.read('users', phone, function (err, data) {
      if (err) {
        // Hash the password
        var hashPassword = helpers.hash(password);

        // Create the user object
        if (hashPassword) {
          var userObject = {
            'firstName': firstName,
            'lastName': lastName,
            'phone': phone,
            'hashPassword': hashPassword,
            'tosAgreement': true
          }

          // Store the user
          _data.create('users', phone, userObject, function (err) {
            if (!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, { 'Error': 'Could not create the new user' })
            }
          });
        } else {
          callback(500, { 'Error': 'Could not the user\'s password' })
        }

      } else {
        // User already exists
        callback(400, { 'Error': 'A user with that phone number already exists' });
      }
    })
  } else {
    callback(400, { 'Error': 'Missing required fields' });
  }
};


// Users - get
// Required data: phone
// Optional data: none
// @TODO Only let an authenticated user access their object and only their data
handlers._users.get = function (data, callback) {
  // Check phone provided is valid
  var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Looking the user
    _data.read('users', phone, function (err, data) {
      if (!err && data) {
        // remove hashed password from the user object before returning
        delete data.hashPassword;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
};


// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one)
// @TODO Only let an authenticated user update their object and only their object data
handlers._users.put = function (data, callback) {
  // Check required field
  var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  // check fir the optional field
  var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
  var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // ERROR IF THE PHONE IS INVALID
  if (phone) {
    if (firstName || lastName || password) {
      // look for a user
      _data.read('users', phone, function (err, userData) {
        if (!err && userData) {
          if (firstName) {
            userData.firstName = firstName
          }
          if (lastName) {
            userData.firstName = lastName
          }
          if (password) {
            userData.hashPassword = helpers.hash(password)
          }

          // store updates
          _data.update('users', phone, userData, function (err) {
            if (!err) {
              callback(200)
            } else {
              console.log(err)
              callback(500, { 'Error': 'Could not update the user' })
            }
          })
        } else {
          callback(400, { 'Error': 'The specified user does not exist' })
        }
      });
    } else {
      callback(400, { 'Error': 'Missing fields to update' })
    }
  } else {
    callback(400, { 'Error': 'Missing required field' })
  }
};


// Users - delete
// Required data: phone
// @TODO Only let an authenticated user delete their object and only their object data
// @TODO Cleanup
handlers._users.delete = function (data, callback) {
  // Check phone provided is valid
  var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
    // Looking the user
    _data.read('users', phone, function (err, data) {
      if (!err && data) {
        _data.delete('users', phone, function (err) {
          if (!err) {
            callback(200)
          } else {
            callback(500, { 'Error': 'Could not delete the specified user' })
          }
        })
      } else {
        callback(400, { 'Error': 'Could not find the specified user' })
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
};


// Tokens
handlers.tokens = function (data, callback) {
  var acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};


// Container for tokens methods
handlers._tokens = {};


// Tokens - post 
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function (data, callback) {

}


// Tokens - get 
handlers._tokens.get = function (data, callback) {
  // check the required data
  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if (phone && password) {
    _data.read('users', phone, function (err, userData) {
      if (!err && userData) {
        // Hash the sent password and compare it to one stored in the user object

      } else {
        callback(400, { 'Error': 'Could not find the specified user' })
      }
    })
  } else {
    callback(400, { 'Error': 'Missing reqyured field(s)' })
  }
}


// Tokens - put 
handlers._tokens.put = function (data, callback) {

}


// Tokens - delete 
handlers._tokens.delete = function (data, callback) {

}


// ping handler
handlers.ping = function (data, callback) {
  callback(200);
};

// not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};


// Export the module
module.exports = handlers;