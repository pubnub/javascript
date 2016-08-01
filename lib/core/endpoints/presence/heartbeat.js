'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.isAuthSupported = isAuthSupported;
exports.getRequestTimeout = getRequestTimeout;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = require('../../flow_interfaces');

function getOperation() {
  return 'PNHeartbeatOperation';
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
  return '/v2/presence/sub-key/' + config.subscribeKey + '/channel/' + encodeURIComponent(stringifiedChannels) + '/heartbeat';
}

function isAuthSupported() {
  return true;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function prepareParams(modules, incomingParams) {
  var _incomingParams$chann2 = incomingParams.channelGroups;
  var channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2;
  var _incomingParams$state = incomingParams.state;
  var state = _incomingParams$state === undefined ? {} : _incomingParams$state;
  var config = modules.config;

  var params = {};

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  params.state = JSON.stringify(state);
  params.heartbeat = config.getPresenceTimeout();
  return params;
}

function handleResponse() {
  return {};
}
//# sourceMappingURL=heartbeat.js.map
