"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.getRequestHeaders = getRequestHeaders;
exports.getRequestTimeout = getRequestTimeout;
exports.handleResponse = handleResponse;
exports.isAuthSupported = isAuthSupported;
exports.postPayload = postPayload;
exports.postURL = postURL;
exports.prepareParams = prepareParams;
exports.usePost = usePost;
exports.validateParams = validateParams;

var _flow_interfaces = require("../../flow_interfaces");

var _operations = _interopRequireDefault(require("../../constants/operations"));

var _utils = _interopRequireDefault(require("../../utils"));

function getOperation() {
  return _operations["default"].PNAddMessageActionOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var action = incomingParams.action,
      channel = incomingParams.channel,
      messageTimetoken = incomingParams.messageTimetoken;
  if (!messageTimetoken) return 'Missing message timetoken';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!channel) return 'Missing message channel';
  if (!action) return 'Missing Action';
  if (!action.value) return 'Missing Action.value';
  if (!action.type) return 'Missing Action.type';
  if (action.type.length > 15) return 'Action.type value exceed maximum length of 15';
}

function usePost() {
  return true;
}

function postURL(_ref2, incomingParams) {
  var config = _ref2.config;
  var channel = incomingParams.channel,
      messageTimetoken = incomingParams.messageTimetoken;
  return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(channel), "/message/").concat(messageTimetoken);
}

function getRequestTimeout(_ref3) {
  var config = _ref3.config;
  return config.getTransactionTimeout();
}

function getRequestHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

function isAuthSupported() {
  return true;
}

function prepareParams() {
  return {};
}

function postPayload(modules, incomingParams) {
  return incomingParams.action;
}

function handleResponse(modules, addMessageActionResponse) {
  return {
    data: addMessageActionResponse.data
  };
}
//# sourceMappingURL=add_message_action.js.map
