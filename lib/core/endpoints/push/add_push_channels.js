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
  var channels = incomingParams.channels;
  var config = modules.config;


  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
  if (!channels || channels.length === 0) return 'Missing Channels';
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
  var _incomingParams$chann = incomingParams.channels;
  var channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

  return { type: pushGateway, add: channels.join(',') };
}

function handleResponse() {
  return {};
}
//# sourceMappingURL=add_push_channels.js.map
