"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(require("../../../constants/operations"));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGetChannelMetadataOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return 'Channel cannot be empty';
    }
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(params.channel);
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  getAuthToken: function getAuthToken(_ref3) {
    var tokenManager = _ref3.tokenManager;
    return tokenManager.getToken('channel');
  },
  prepareParams: function prepareParams(_, params) {
    var _ref4, _params$include;

    return {
      include: ((_ref4 = params === null || params === void 0 ? void 0 : (_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) !== null && _ref4 !== void 0 ? _ref4 : true) && ['custom']
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
//# sourceMappingURL=get.js.map
