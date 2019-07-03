'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.usePatch = usePatch;
exports.getURL = getURL;
exports.patchURL = patchURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.prepareParams = prepareParams;
exports.patchPayload = patchPayload;
exports.handleResponse = handleResponse;

var _flow_interfaces = require('../../flow_interfaces');

var _operations = require('../../constants/operations');

var _operations2 = _interopRequireDefault(_operations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prepareMessagePayload(modules, messagePayload) {
  var crypto = modules.crypto,
      config = modules.config;

  var stringifiedPayload = JSON.stringify(messagePayload);

  if (config.cipherKey) {
    stringifiedPayload = crypto.encrypt(stringifiedPayload);
    stringifiedPayload = JSON.stringify(stringifiedPayload);
  }

  return stringifiedPayload;
}

function getOperation() {
  return _operations2.default.PNUpdateUserOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var id = incomingParams.id,
      custom = incomingParams.custom;


  if (!id) return 'Missing User.id';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (custom) {
    if (!Object.values(custom).every(function (value) {
      return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    })) {
      return 'Invalid custom type, only string, number and boolean values are allowed.';
    }
  }
}

function usePatch() {
  return true;
}

function getURL(modules) {
  var config = modules.config;

  return '/v1/objects/' + config.subscribeKey + '/users';
}

function patchURL(modules) {
  var config = modules.config;

  return '/v1/objects/' + config.subscribeKey + '/users';
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var _incomingParams$chann = incomingParams.channelGroups,
      channelGroups = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

  var params = {};

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  return params;
}

function patchPayload(modules, incomingParams) {
  var message = incomingParams.message;

  return prepareMessagePayload(modules, message);
}

function handleResponse(modules, usersResponse) {
  return usersResponse;
}
//# sourceMappingURL=update_user.js.map
