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
  return 'PNRemoveChannelsFromGroupOperation';
}

function validateParams(modules, incomingParams) {
  var channels = incomingParams.channels;
  var channelGroup = incomingParams.channelGroup;
  var config = modules.config;


  if (!channelGroup) return 'Missing Channel Group';
  if (!channels || channels.length === 0) return 'Missing Channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var channelGroup = incomingParams.channelGroup;
  var config = modules.config;

  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group/' + channelGroup;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var _incomingParams$chann = incomingParams.channels;
  var channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;


  return {
    remove: channels.join(',')
  };
}

function handleResponse() {
  return {};
}
//# sourceMappingURL=remove_channels.js.map
