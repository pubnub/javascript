"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
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
  return _operations["default"].PNGetUserOperation;
}

function validateParams(modules, incomingParams) {
  var userId = incomingParams.userId;
  if (!userId) return 'Missing userId';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(incomingParams.userId);
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function getAuthToken(modules, incomingParams) {
  var token = modules.tokenManager.getToken('user', incomingParams.userId) || modules.tokenManager.getToken('user');
  return token;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include;
  var params = {};

  if (!include) {
    include = {
      customFields: true
    };
  } else if (include.customFields === undefined) {
    include.customFields = true;
  }

  if (include) {
    var includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

function handleResponse(modules, usersResponse) {
  return usersResponse;
}
//# sourceMappingURL=get_user.js.map
