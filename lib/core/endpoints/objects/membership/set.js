"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _operations = _interopRequireDefault(require("../../../constants/operations"));

var _utils = _interopRequireDefault(require("../../../utils"));

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNSetMembershipsOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params !== null && params !== void 0 && params.channels) || (params === null || params === void 0 ? void 0 : params.channels.length) === 0) {
      return 'Channels cannot be empty';
    }
  },
  usePatch: function usePatch() {
    return true;
  },
  patchURL: function patchURL(_ref, params) {
    var _params$uuid;

    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(_utils["default"].encodeString((_params$uuid = params.uuid) !== null && _params$uuid !== void 0 ? _params$uuid : config.getUUID()), "/channels");
  },
  patchPayload: function patchPayload(_, params) {
    return (0, _defineProperty2["default"])({
      set: [],
      remove: []
    }, params.type, params.channels.map(function (channel) {
      if (typeof channel === 'string') {
        return {
          channel: {
            id: channel
          }
        };
      } else {
        return {
          channel: {
            id: channel.id
          },
          custom: channel.custom
        };
      }
    }));
  },
  getRequestTimeout: function getRequestTimeout(_ref3) {
    var config = _ref3.config;
    return config.getTransactionTimeout();
  },
  isAuthSupported: function isAuthSupported() {
    return true;
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include4, _params$page, _params$page3;

    var queryParams = {};

    if (params !== null && params !== void 0 && params.include) {
      var _params$include, _params$include2, _params$include3;

      queryParams.include = [];

      if ((_params$include = params.include) !== null && _params$include !== void 0 && _params$include.customFields) {
        queryParams.include.push('custom');
      }

      if ((_params$include2 = params.include) !== null && _params$include2 !== void 0 && _params$include2.customChannelFields) {
        queryParams.include.push('channel.custom');
      }

      if ((_params$include3 = params.include) !== null && _params$include3 !== void 0 && _params$include3.channelFields) {
        queryParams.include.push('channel');
      }

      queryParams.include = queryParams.include.join(',');
    }

    if (params !== null && params !== void 0 && (_params$include4 = params.include) !== null && _params$include4 !== void 0 && _params$include4.totalCount) {
      queryParams.count = true;
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

    if (params !== null && params !== void 0 && params.limit) {
      queryParams.limit = params.limit;
    }

    if (params !== null && params !== void 0 && params.sort) {
      var _params$sort;

      queryParams.sort = Object.entries((_params$sort = params.sort) !== null && _params$sort !== void 0 ? _params$sort : {}).map(function (_ref4) {
        var _ref5 = (0, _slicedToArray2["default"])(_ref4, 2),
            key = _ref5[0],
            value = _ref5[1];

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
//# sourceMappingURL=set.js.map
