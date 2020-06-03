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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var endpoint = {
  getOperation: function getOperation() {
    return _operations["default"].PNSetMembersOperation;
  },
  validateParams: function validateParams(_, params) {
    if (!(params === null || params === void 0 ? void 0 : params.channel)) {
      return 'Channel cannot be empty';
    }

    if (!(params === null || params === void 0 ? void 0 : params.uuids) || (params === null || params === void 0 ? void 0 : params.uuids.length) === 0) {
      return 'UUIDs cannot be empty';
    }
  },
  usePatch: function usePatch() {
    return true;
  },
  patchURL: function patchURL(_ref, params) {
    var config = _ref.config;
    return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(params.channel, "/uuids");
  },
  patchPayload: function patchPayload(_, params) {
    return _defineProperty({
      set: [],
      remove: []
    }, params.type, params.uuids.map(function (uuid) {
      if (typeof uuid === 'string') {
        return {
          uuid: {
            id: uuid
          }
        };
      } else {
        return {
          uuid: {
            id: uuid.id
          },
          custom: uuid.custom
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
  getAuthToken: function getAuthToken(_ref4) {
    var tokenManager = _ref4.tokenManager;
    return tokenManager.getToken('member');
  },
  prepareParams: function prepareParams(_modules, params) {
    var _params$include4, _params$page, _params$page3;

    var queryParams = {};

    if (params === null || params === void 0 ? void 0 : params.include) {
      var _params$include, _params$include2, _params$include3;

      queryParams.include = [];

      if ((_params$include = params.include) === null || _params$include === void 0 ? void 0 : _params$include.customFields) {
        queryParams.include.push('custom');
      }

      if ((_params$include2 = params.include) === null || _params$include2 === void 0 ? void 0 : _params$include2.customUUIDFields) {
        queryParams.include.push('uuid.custom');
      }

      if ((_params$include3 = params.include) === null || _params$include3 === void 0 ? void 0 : _params$include3.UUIDFields) {
        queryParams.include.push('uuid');
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

    if (params === null || params === void 0 ? void 0 : params.limit) {
      queryParams.limit = params.limit;
    }

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
