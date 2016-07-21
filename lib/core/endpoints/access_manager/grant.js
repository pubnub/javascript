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
  return 'PNAccessManagerGrant';
}

function validateParams(modules) {
  var config = modules.config;


  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules) {
  var config = modules.config;

  return '/v1/auth/grant/sub-key/' + config.subscribeKey;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return false;
}

function prepareParams(modules, incomingParams) {
  var _incomingParams$chann = incomingParams.channels;
  var channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;
  var _incomingParams$chann2 = incomingParams.channelGroups;
  var channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2;
  var ttl = incomingParams.ttl;
  var _incomingParams$read = incomingParams.read;
  var read = _incomingParams$read === undefined ? false : _incomingParams$read;
  var _incomingParams$write = incomingParams.write;
  var write = _incomingParams$write === undefined ? false : _incomingParams$write;
  var _incomingParams$manag = incomingParams.manage;
  var manage = _incomingParams$manag === undefined ? false : _incomingParams$manag;
  var _incomingParams$authK = incomingParams.authKeys;
  var authKeys = _incomingParams$authK === undefined ? [] : _incomingParams$authK;

  var params = {};

  params.r = read ? '1' : '0';
  params.w = write ? '1' : '0';
  params.m = manage ? '1' : '0';
  params.timestamp = Math.floor(new Date().getTime() / 1000);

  if (channels.length > 0) {
    params.channel = channels.join(',');
  }

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  if (authKeys.length > 0) {
    params.auth = authKeys.join(',');
  }

  if (ttl || ttl === 0) {
    params.ttl = ttl;
  }

  return params;
}

function handleResponse() {
  return {};
}
//# sourceMappingURL=grant.js.map
