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

var _operations = require('../../constants/operations');

var _operations2 = _interopRequireDefault(_operations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getOperation() {
  return _operations2.default.PNAccessManagerGrant;
}

function validateParams(modules) {
  var config = modules.config;


  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!config.publishKey) return 'Missing Publish Key';
  if (!config.secretKey) return 'Missing Secret Key';
}

function getURL(modules) {
  var config = modules.config;

  return '/v2/auth/grant/sub-key/' + config.subscribeKey;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return false;
}

function prepareParams(modules, incomingParams) {
  var _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann,
      _incomingParams$chann2 = incomingParams.channelGroups,
      channelGroups = _incomingParams$chann2 === undefined ? [] : _incomingParams$chann2,
      ttl = incomingParams.ttl,
      _incomingParams$read = incomingParams.read,
      read = _incomingParams$read === undefined ? false : _incomingParams$read,
      _incomingParams$write = incomingParams.write,
      write = _incomingParams$write === undefined ? false : _incomingParams$write,
      _incomingParams$manag = incomingParams.manage,
      manage = _incomingParams$manag === undefined ? false : _incomingParams$manag,
      _incomingParams$authK = incomingParams.authKeys,
      authKeys = _incomingParams$authK === undefined ? [] : _incomingParams$authK;

  var params = {};

  params.r = read ? '1' : '0';
  params.w = write ? '1' : '0';
  params.m = manage ? '1' : '0';

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
