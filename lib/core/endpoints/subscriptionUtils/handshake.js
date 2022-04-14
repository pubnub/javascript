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
    return _operations["default"].PNHandshakeOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params !== null && params !== void 0 && params.channels) && !(params !== null && params !== void 0 && params.channelGroups)) {
      return 'channels and channleGroups both should not be empty';
    }
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    var channelsString = params.channels ? params.channels.join(',') : ',';
    return "/v2/subscribe/".concat(config.subscribeKey, "/").concat(_utils["default"].encodeString(channelsString), "/0");
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getSubscribeTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  prepareParams: function prepareParams(_, params) {
    var outParams = {};

    if (params.channelGroups) {
      outParams['channel-group'] = params.channelGroups.join(',');
    }

    outParams.tt = 0;
    return outParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      region: response.t.r,
      timetoken: response.t.t
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=handshake.js.map
