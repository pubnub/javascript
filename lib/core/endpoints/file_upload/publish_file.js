"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _operations = _interopRequireDefault(require("../../constants/operations"));

var _utils = _interopRequireDefault(require("../../utils"));

var preparePayload = function preparePayload(_ref, payload) {
  var crypto = _ref.crypto,
      config = _ref.config;
  var stringifiedPayload = JSON.stringify(payload);

  if (config.cipherKey) {
    stringifiedPayload = crypto.encrypt(stringifiedPayload);
    stringifiedPayload = JSON.stringify(stringifiedPayload);
  }

  return stringifiedPayload || '';
};

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNPublishFileOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params !== null && params !== void 0 && params.channel)) {
      return "channel can't be empty";
    }

    if (!(params !== null && params !== void 0 && params.fileId)) {
      return "file id can't be empty";
    }

    if (!(params !== null && params !== void 0 && params.fileName)) {
      return "file name can't be empty";
    }
  },
  getURL: function getURL(modules, params) {
    var _modules$config = modules.config,
        publishKey = _modules$config.publishKey,
        subscribeKey = _modules$config.subscribeKey;
    var message = {
      message: params.message,
      file: {
        name: params.fileName,
        id: params.fileId
      }
    };
    var payload = preparePayload(modules, message);
    return "/v1/files/publish-file/".concat(publishKey, "/").concat(subscribeKey, "/0/").concat(_utils["default"].encodeString(params.channel), "/0/").concat(_utils["default"].encodeString(payload));
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  prepareParams: function prepareParams(_, params) {
    var outParams = {};

    if (params.ttl) {
      outParams.ttl = params.ttl;
    }

    if (params.storeInHistory !== undefined) {
      outParams.store = params.storeInHistory ? '1' : '0';
    }

    if (params.meta && (0, _typeof2["default"])(params.meta) === 'object') {
      outParams.meta = JSON.stringify(params.meta);
    }

    return outParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      timetoken: response['2']
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=publish_file.js.map
