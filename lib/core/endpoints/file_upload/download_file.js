"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(require("../../constants/operations"));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNDownloadFileOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return "channel can't be empty";
    }

    if (!(params === null || params === void 0 ? void 0 : params.name)) {
      return "name can't be empty";
    }

    if (!(params === null || params === void 0 ? void 0 : params.id)) {
      return "id can't be empty";
    }
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(params.channel, "/files/").concat(params.id, "/").concat(params.name);
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  ignoreBody: function ignoreBody() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('fileUpload');
  },
  prepareParams: function prepareParams() {
    return {};
  },
  handleResponse: function handleResponse(_ref4, response, params) {
    var getFile = _ref4.getFile;
    return getFile().create({
      stream: response.response.res,
      name: params.name,
      mimeType: response.headers['content-type'],
      response: response.response
    });
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=download_file.js.map
