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
    return _operations["default"].PNListFilesOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params !== null && params !== void 0 && params.channel)) {
      return "channel can't be empty";
    }

    if (!(params !== null && params !== void 0 && params.id)) {
      return "file id can't be empty";
    }

    if (!(params !== null && params !== void 0 && params.name)) {
      return "file name can't be empty";
    }
  },
  useDelete: function useDelete() {
    return true;
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(_utils["default"].encodeString(params.channel), "/files/").concat(params.id, "/").concat(params.name);
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  prepareParams: function prepareParams() {
    return {};
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=delete_file.js.map
