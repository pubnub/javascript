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

var _flow_interfaces = require("../flow_interfaces");

var _operations = _interopRequireDefault(require("../constants/operations"));

var _utils = _interopRequireDefault(require("../utils"));

function prepareMessagePayload(modules, messagePayload) {
  var stringifiedPayload = JSON.stringify(messagePayload);
  return stringifiedPayload;
}

function getOperation() {
  return _operations["default"].PNSignalOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var message = incomingParams.message,
      channel = incomingParams.channel;
  if (!channel) return 'Missing Channel';
  if (!message) return 'Missing Message';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var channel = incomingParams.channel,
      message = incomingParams.message;
  var stringifiedPayload = prepareMessagePayload(modules, message);
  return "/signal/".concat(config.publishKey, "/").concat(config.subscribeKey, "/0/").concat(_utils["default"].encodeString(channel), "/0/").concat(_utils["default"].encodeString(stringifiedPayload));
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams() {
  var params = {};
  return params;
}

function handleResponse(modules, serverResponse) {
  return {
    timetoken: serverResponse[2]
  };
}
//# sourceMappingURL=signal.js.map
