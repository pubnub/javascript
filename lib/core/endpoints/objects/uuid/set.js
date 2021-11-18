"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(require("../../../constants/operations"));

var _utils = _interopRequireDefault(require("../../../utils"));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNSetUUIDMetadataOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params !== null && params !== void 0 && params.data)) {
      return 'Data cannot be empty';
    }
  },
  usePatch: function usePatch() {
    return true;
  },
  patchURL: function patchURL(_ref, params) {
    var _params$uuid;

    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(_utils["default"].encodeString((_params$uuid = params.uuid) !== null && _params$uuid !== void 0 ? _params$uuid : config.getUUID()));
  },
  patchPayload: function patchPayload(_, params) {
    return params.data;
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  prepareParams: function prepareParams(_ref3, params) {
    var _params$uuid2, _params$include$custo, _params$include;

    var config = _ref3.config;
    return {
      uuid: (_params$uuid2 = params === null || params === void 0 ? void 0 : params.uuid) !== null && _params$uuid2 !== void 0 ? _params$uuid2 : config.getUUID(),
      include: ((_params$include$custo = params === null || params === void 0 ? void 0 : (_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) !== null && _params$include$custo !== void 0 ? _params$include$custo : true) && 'custom'
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
//# sourceMappingURL=set.js.map
