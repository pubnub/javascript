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
  return _operations["default"].PNDeleteUserOperation;
}

function validateParams(_ref, userId) {
  var config = _ref.config;
  if (!userId) return 'Missing UserId';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function useDelete() {
  return true;
}

function getURL(modules, userId) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(_utils["default"].encodeString(userId));
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams() {
  return {};
}

function handleResponse(modules, usersResponse) {
  return usersResponse;
}
//# sourceMappingURL=delete_user.js.map
