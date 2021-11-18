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

var _utils = _interopRequireDefault(require("../../utils"));

function getOperation() {
  return _operations["default"].PNGetMessageActionsOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var channel = incomingParams.channel;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!channel) return 'Missing message channel';
}

function getURL(_ref2, incomingParams) {
  var config = _ref2.config;
  var channel = incomingParams.channel;
  return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(channel));
}

function getRequestTimeout(_ref3) {
  var config = _ref3.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var limit = incomingParams.limit,
      start = incomingParams.start,
      end = incomingParams.end;
  var outgoingParams = {};
  if (limit) outgoingParams.limit = limit;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  return outgoingParams;
}

function handleResponse(modules, getMessageActionsResponse) {
  var response = {
    data: getMessageActionsResponse.data,
    start: null,
    end: null
  };

  if (response.data.length) {
    response.end = response.data[response.data.length - 1].actionTimetoken;
    response.start = response.data[0].actionTimetoken;
  }

  return response;
}
//# sourceMappingURL=get_message_actions.js.map
