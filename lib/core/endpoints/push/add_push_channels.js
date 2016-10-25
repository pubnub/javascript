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
  return _operations2.default.PNPushNotificationEnabledChannelsOperation;
}

function validateParams(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway,
      channels = incomingParams.channels;
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
  var pushGateway = incomingParams.pushGateway,
      _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;

  return { type: pushGateway, add: channels.join(',') };
}

function handleResponse() {
  return {};
}
//# sourceMappingURL=add_push_channels.js.map
