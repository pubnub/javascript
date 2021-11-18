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
exports.useDelete = useDelete;
exports.validateParams = validateParams;

var _flow_interfaces = require("../../flow_interfaces");

var _operations = _interopRequireDefault(require("../../constants/operations"));

var _utils = _interopRequireDefault(require("../../utils"));

function getOperation() {
  return _operations["default"].PNDeleteMessagesOperation;
}

function validateParams(modules, incomingParams) {
  var channel = incomingParams.channel;
  var config = modules.config;
  if (!channel) return 'Missing channel';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function useDelete() {
  return true;
}

function getURL(modules, incomingParams) {
  var channel = incomingParams.channel;
  var config = modules.config;
  return "/v3/history/sub-key/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(channel));
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var start = incomingParams.start,
      end = incomingParams.end;
  var outgoingParams = {};
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  return outgoingParams;
}

function handleResponse(modules, serverResponse) {
  return serverResponse.payload;
}
//# sourceMappingURL=delete_messages.js.map
