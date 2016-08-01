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
  return 'PNUnsubscribeOperation';
}

function validateParams(modules) {
  var config = modules.config;


  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$chann = incomingParams.channels;
  var channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return '/v2/presence/sub-key/' + config.subscribeKey + '/channel/' + encodeURIComponent(stringifiedChannels) + '/leave';
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var _incomingParams$chann2 = incomingParams.channelGroups;
  var channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2;

  var params = {};

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  return params;
}

function handleResponse() {
  return {};
}
//# sourceMappingURL=leave.js.map
