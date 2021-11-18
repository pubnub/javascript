"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.getRequestTimeout = getRequestTimeout;
exports.getURL = getURL;
exports.handleResponse = handleResponse;
exports.isAuthSupported = isAuthSupported;
exports.prepareParams = prepareParams;
exports.validateParams = validateParams;

var _flow_interfaces = require("../../flow_interfaces");

var _operations = _interopRequireDefault(require("../../constants/operations"));

function getOperation() {
  return _operations["default"].PNPushNotificationEnabledChannelsOperation;
}

function validateParams(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway,
      channels = incomingParams.channels,
      topic = incomingParams.topic;
  var config = modules.config;
  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
  if (pushGateway === 'apns2' && !topic) return 'Missing APNS2 topic';
  if (!channels || channels.length === 0) return 'Missing Channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var device = incomingParams.device,
      pushGateway = incomingParams.pushGateway;
  var config = modules.config;

  if (pushGateway === 'apns2') {
    return "/v2/push/sub-key/".concat(config.subscribeKey, "/devices-apns2/").concat(device);
  }

  return "/v1/push/sub-key/".concat(config.subscribeKey, "/devices/").concat(device);
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
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann,
      _incomingParams$envir = incomingParams.environment,
      environment = _incomingParams$envir === void 0 ? 'development' : _incomingParams$envir,
      topic = incomingParams.topic;
  var parameters = {
    type: pushGateway,
    remove: channels.join(',')
  };

  if (pushGateway === 'apns2') {
    parameters = Object.assign({}, parameters, {
      environment: environment,
      topic: topic
    });
    delete parameters.type;
  }

  return parameters;
}

function handleResponse() {
  return {};
}
//# sourceMappingURL=remove_push_channels.js.map
