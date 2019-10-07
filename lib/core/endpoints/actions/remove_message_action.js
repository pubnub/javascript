"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.useDelete = useDelete;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = require("../../flow_interfaces");

var _operations = _interopRequireDefault(require("../../constants/operations"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getOperation() {
  return _operations["default"].PNRemoveMessageActionOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var channel = incomingParams.channel,
      actionTimetoken = incomingParams.actionTimetoken,
      messageTimetoken = incomingParams.messageTimetoken;
  if (!messageTimetoken) return 'Missing message timetoken';
  if (!actionTimetoken) return 'Missing action timetoken';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!channel) return 'Missing message channel';
}

function useDelete() {
  return true;
}

function getURL(_ref2, incomingParams) {
  var config = _ref2.config;
  var channel = incomingParams.channel,
      actionTimetoken = incomingParams.actionTimetoken,
      messageTimetoken = incomingParams.messageTimetoken;
  return "/v1/message-actions/".concat(config.subscribeKey, "/channel/").concat(channel, "/message/").concat(messageTimetoken, "/action/").concat(actionTimetoken);
}

function getRequestTimeout(_ref3) {
  var config = _ref3.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams() {
  return {};
}

function handleResponse(modules, removeMessageActionResponse) {
  return {
    data: removeMessageActionResponse.data
  };
}
//# sourceMappingURL=remove_message_action.js.map
