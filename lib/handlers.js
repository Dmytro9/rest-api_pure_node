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
handlers._users.get = function (data, callback) {
  // Check phone provided is valid
  var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {

    // Get the token from the headers
    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
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
        callback(400, { 'Error': 'Missing required token in header or token is invalid' });
      }
    });

  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
};


// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one)
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

      // Get the token from the headers
      var token = typeof (data.headers.token) == 'string' ? data.headers.token : false
      // Verify that the given token is valid for the phone number
      handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
        if (tokenIsValid) {
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
          callback(400, { 'Error': 'Missing required token in header or token is invalid' });
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
handlers._users.delete = function (data, callback) {
  // Check phone provided is valid
  var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
  if (phone) {

    // Get the token from the headers
    var token = typeof (data.headers.token) == 'string' ? data.headers.token : false
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
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
        callback(400, { 'Error': 'Missing required token in header or token is invalid' });
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
    handlers._tokens[data.method](data, callback);
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
  var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
  var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone && password) {
    // lookup the user who mathes thet phone number
    _data.read('users', phone, function (err, userData) {
      if (!err && userData) {
        // Hash the sent password and compare it to one stored in the user object
        var hashPassword = helpers.hash(password);
        if (hashPassword == userData.hashPassword) {
          // if valid, create a new token with a random name. Set expiration date 1 hour in the future
          var tokenId = helpers.createRandomString(20);
          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            'phone': phone,
            'id': tokenId,
            'expires': expires
          };

          // Store the token
          _data.create('tokens', tokenId, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { 'Error': 'Could not create the new token' });
            }
          });
        } else {
          callback(400, { 'Error': 'Password did not match the specified user\'s stored password' });
        }
      } else {
        callback(400, { 'Error': 'Could not find the specified user' });
      }
    })
  } else {
    callback(400, { 'Error': 'Missing reqyured field(s)' })
  }
}


// Tokens - get 
// Required data: id
// Optional data: none
handlers._tokens.get = function (data, callback) {
  // check the phone number is valid
  var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Looking the token
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
}

// Tokens - put 
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function (data, callback) {
  var id = typeof (data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
  var extend = typeof (data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
  if (id && extend) {
    // Lookup the token
    _data.read('tokens', id, function (err, tokenData) {
      if (!err && tokenData) {
        // Check to make sure token is not already expired
        if (tokenData.expires > Date.now()) {
          // Set the expirationan hour from now
          tokenData.expires = Date.now() + 1000 * 60 * 60;

          // Store the new updates
          _data.update('tokens', id, tokenData, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { 'Error': 'Could not update the token\'s expiration' });
            }
          })
        } else {
          callback(400, { 'Error': 'The token has already expired and can not be extended' });
        }
      } else {
        callback(400, { 'Error': 'Specified token does not exists' });
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field or field(s) are invalid' });
  }
}


// Tokens - delete 
handlers._tokens.delete = function (data, callback) {
  // Check the id is valid
  var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Looking the token
    _data.read('tokens', id, function (err, data) {
      if (!err && data) {
        _data.delete('tokens', id, function (err) {
          if (!err) {
            callback(200)
          } else {
            callback(500, { 'Error': 'Could not delete the specified token' })
          }
        })
      } else {
        callback(400, { 'Error': 'Could not find the specified token' })
      }
    });
  } else {
    callback(400, { 'Error': 'Missing required field' });
  }
}


// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone, callback) {
  // Lookup the token
  _data.read('tokens', id, function (err, tokenData) {
    if (!err && tokenData) {
      // Check the token is for given user and has not expired
      if (tokenData.phone == phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  })
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