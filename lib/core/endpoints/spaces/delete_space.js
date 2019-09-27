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
exports.getAuthToken = getAuthToken;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = require("../../flow_interfaces");

var _operations = _interopRequireDefault(require("../../constants/operations"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function getOperation() {
  return _operations["default"].PNDeleteSpaceOperation;
}

function validateParams(_ref, spaceId) {
  var config = _ref.config;
  if (!spaceId) return 'Missing SpaceId';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function useDelete() {
  return true;
}

function getURL(modules, spaceId) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(spaceId);
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, spaceId) {
  var token = modules.tokenManager.getToken('space', spaceId) || modules.tokenManager.getToken('space');
  return token;
}

function prepareParams() {
  return {};
}

function handleResponse(modules, spacesResponse) {
  return spacesResponse;
}
//# sourceMappingURL=delete_space.js.map
