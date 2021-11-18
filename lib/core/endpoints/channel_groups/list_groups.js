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
  return _operations["default"].PNChannelGroupsOperation;
}

function validateParams(modules) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules) {
  var config = modules.config;
  return "/v1/channel-registration/sub-key/".concat(config.subscribeKey, "/channel-group");
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams() {
  return {};
}

function handleResponse(modules, serverResponse) {
  return {
    groups: serverResponse.payload.groups
  };
}
//# sourceMappingURL=list_groups.js.map
