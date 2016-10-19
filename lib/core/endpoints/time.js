'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.prepareParams = prepareParams;
exports.isAuthSupported = isAuthSupported;
exports.handleResponse = handleResponse;
exports.validateParams = validateParams;

var _flow_interfaces = require('../flow_interfaces');

var _operations = require('../constants/operations');

var _operations2 = _interopRequireDefault(_operations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getOperation() {
  return _operations2.default.PNTimeOperation;
}

function getURL() {
  return '/time/0';
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function prepareParams() {
  return {};
}

function isAuthSupported() {
  return false;
}

function handleResponse(modules, serverResponse) {
  return {
    timetoken: serverResponse[0]
  };
}

function validateParams() {}
//# sourceMappingURL=time.js.map
