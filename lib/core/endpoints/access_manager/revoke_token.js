"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(require("../../constants/operations"));

var _utils = _interopRequireDefault(require("../../utils"));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNAccessManagerRevokeToken;
  },
  validateParams: function validateParams(modules, token) {
    var secretKey = modules.config.secretKey;

    if (!secretKey) {
      return 'Missing Secret Key';
    }

    if (!token) {
      return "token can't be empty";
    }
  },
  getURL: function getURL(_ref, token) {
    var config = _ref.config;
    return "/v3/pam/".concat(config.subscribeKey, "/grant/").concat(_utils["default"].encodeString(token));
  },
  useDelete: function useDelete() {
    return true;
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return false;
  },
  prepareParams: function prepareParams(_ref3) {
    var config = _ref3.config;
    return {
      uuid: config.getUUID()
    };
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=revoke_token.js.map
