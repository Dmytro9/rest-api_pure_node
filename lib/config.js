/*
 * Create and export configuration variables
 * 
**/

// container for all environments
var environments = {};

// staging (default) environment
environments.staging = {
  'httpPort': 4000,
  'httpsPort': 4001,
  'envName': 'staging',
  'hashingSecret': 'thisIsASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': 'AC5f55ff7fdbb81a493b56d772864ec47a',
    'authToken': '34bed61b06bfd6a477191ee9d3c625f9',
    'fromPhone': '+13239184336',
  },
  'templateGlobals': {
    'appName': 'UptimeChecker',
    'companyName': 'NotARealCompany, Inc',
    'yearCreated': '2019',
    'baseUrl': 'http://localhost:3000/'
  }
}

// production environment
environments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': 'production',
  'hashingSecret': 'thisIsAlsoASecret',
  'maxChecks': 5,
  'twilio': {
    'accountSid': '',
    'authToken': '',
    'fromPhone': '',
  },
  'templateGlobals': {
    'appName': 'UptimeChecker',
    'companyName': 'NotARealCompany, Inc',
    'yearCreated': '2019',
    'baseUrl': 'http://localhost:5000/'
  }
}

// determine which env was passed as a command-line argment
var currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// check env as one of env above and if not set default
var environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// export the module
module.exports = environmentToExport;