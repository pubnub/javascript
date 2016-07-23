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
  return 'PNPushNotificationEnabledChannelsOperation';
}

function validateParams(modules, incomingParams) {
  var device = incomingParams.device;
  var pushGateway = incomingParams.pushGateway;
  var config = modules.config;


  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var device = incomingParams.device;
  var config = modules.config;

  return '/v1/push/sub-key/' + config.subscribeKey + '/devices/' + device;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var pushGateway = incomingParams.pushGateway;

  return { type: pushGateway };
}

function handleResponse(modules, serverResponse) {
  return { channels: serverResponse };
}
//# sourceMappingURL=list_push_channels.js.map
