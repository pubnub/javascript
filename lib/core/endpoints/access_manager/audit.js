'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = require('../../flow_interfaces');

function getOperation() {
  return 'PNAccessManagerAudit';
}

function validateParams(modules) {
  var config = modules.config;


  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules) {
  var config = modules.config;

  return '/v1/auth/audit/sub-key/' + config.subscribeKey;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return false;
}

function prepareParams(modules, incomingParams) {
  var channel = incomingParams.channel;
  var channelGroup = incomingParams.channelGroup;
  var _incomingParams$authK = incomingParams.authKeys;
  var authKeys = _incomingParams$authK === undefined ? [] : _incomingParams$authK;

  var params = {};

  params.timestamp = Math.floor(new Date().getTime() / 1000);

  if (channel) {
    params.channel = channel;
  }

  if (channelGroup) {
    params['channel-group'] = channelGroup;
  }

  if (authKeys.length > 0) {
    params.auth = authKeys.join(',');
  }

  return params;
}

function handleResponse(modules, serverResponse) {
  return serverResponse.payload;
}
//# sourceMappingURL=audit.js.map
