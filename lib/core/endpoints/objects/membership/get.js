"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _operations = _interopRequireDefault(require("../../../constants/operations"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNGetMembershipsOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.uuid)) {
      return 'UUID cannot be empty';
    }
  },
  getURL: function getURL(_ref, params) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/uuids/").concat(params.uuid, "/channels");
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
    return tokenManager.getToken('membership');
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include4, _params$page, _params$page3, _ref4;

    var queryParams = {};

    if (params === null || params === void 0 ? void 0 : params.include) {
      var _params$include, _params$include2, _params$include3;

      queryParams.include = [];

      if ((_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) {
        queryParams.include.push('custom');
      }

      if ((_params$include2 = params.include) === null || _params$include2 === void 0 ? void 0 : _params$include2.customChannelFields) {
        queryParams.include.push('channel.custom');
      }

      if ((_params$include3 = params.include) === null || _params$include3 === void 0 ? void 0 : _params$include3.channelFields) {
        queryParams.include.push('channel');
      }
    }

    if (params === null || params === void 0 ? void 0 : (_params$include4 = params.include) === null || _params$include4 === void 0 ? void 0 : _params$include4.totalCount) {
      queryParams.count = true;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page = params.page) === null || _params$page === void 0 ? void 0 : _params$page.next) {
      var _params$page2;

      queryParams.start = (_params$page2 = params.page) === null || _params$page2 === void 0 ? void 0 : _params$page2.next;
    }

    if (params === null || params === void 0 ? void 0 : (_params$page3 = params.page) === null || _params$page3 === void 0 ? void 0 : _params$page3.prev) {
      var _params$page4;

      queryParams.end = (_params$page4 = params.page) === null || _params$page4 === void 0 ? void 0 : _params$page4.prev;
    }

    if (params === null || params === void 0 ? void 0 : params.filter) {
      queryParams.filter = params.filter;
    }

    queryParams.limit = (_ref4 = params === null || params === void 0 ? void 0 : params.limit) !== null && _ref4 !== void 0 ? _ref4 : 100;

    if (params === null || params === void 0 ? void 0 : params.sort) {
      var _params$sort;

      queryParams.sort = Object.entries((_params$sort = params.sort) !== null && _params$sort !== void 0 ? _params$sort : {}).map(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2),
            key = _ref6[0],
            value = _ref6[1];

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
      data: response.data
    };
  }
};
var _default = endpoint;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=get.js.map
