"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _operations = _interopRequireDefault(require("../../../constants/operations"));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGetAllChannelMetadataOperation;
  },
  validateParams: function validateParams() {},
  getURL: function getURL(_ref) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/channels");
  },
  getRequestTimeout: function getRequestTimeout(_ref2) {
    var config = _ref2.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include, _params$include2, _params$page, _params$page3, _params$limit;

    var queryParams = {};

    if (params !== null && params !== void 0 && (_params$include = params.include) !== null && _params$include !== void 0 && _params$include.customFields) {
      queryParams.include = 'custom';
    }

    if (params !== null && params !== void 0 && (_params$include2 = params.include) !== null && _params$include2 !== void 0 && _params$include2.totalCount) {
      var _params$include3;

      queryParams.count = (_params$include3 = params.include) === null || _params$include3 === void 0 ? void 0 : _params$include3.totalCount;
    }

    if (params !== null && params !== void 0 && (_params$page = params.page) !== null && _params$page !== void 0 && _params$page.next) {
      var _params$page2;

      queryParams.start = (_params$page2 = params.page) === null || _params$page2 === void 0 ? void 0 : _params$page2.next;
    }

    if (params !== null && params !== void 0 && (_params$page3 = params.page) !== null && _params$page3 !== void 0 && _params$page3.prev) {
      var _params$page4;

      queryParams.end = (_params$page4 = params.page) === null || _params$page4 === void 0 ? void 0 : _params$page4.prev;
    }

    if (params !== null && params !== void 0 && params.filter) {
      queryParams.filter = params.filter;
    }

    queryParams.limit = (_params$limit = params === null || params === void 0 ? void 0 : params.limit) !== null && _params$limit !== void 0 ? _params$limit : 100;

    if (params !== null && params !== void 0 && params.sort) {
      var _params$sort;

      queryParams.sort = Object.entries((_params$sort = params.sort) !== null && _params$sort !== void 0 ? _params$sort : {}).map(function (_ref3) {
        var _ref4 = (0, _slicedToArray2["default"])(_ref3, 2),
            key = _ref4[0],
            value = _ref4[1];

        if (value === 'asc' || value === 'desc') {
          return "".concat(key, ":").concat(value);
        } else {
          return key;
        }
      });
    }

    return queryParams;
  },
  handleResponse: function handleResponse(_, response) {
    return {
      status: response.status,
      data: response.data,
      totalCount: response.totalCount,
      prev: response.prev,
      next: response.next
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=get_all.js.map
