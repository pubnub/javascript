"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.getRequestTimeout = getRequestTimeout;
exports.getURL = getURL;
exports.handleResponse = handleResponse;
exports.isAuthSupported = isAuthSupported;
exports.prepareParams = prepareParams;
exports.validateParams = validateParams;

var _flow_interfaces = require("../../flow_interfaces");

var _operations = _interopRequireDefault(require("../../constants/operations"));

var _utils = _interopRequireDefault(require("../../utils"));

function getOperation() {
  return _operations["default"].PNGetMembershipsOperation;
}

function validateParams(modules, incomingParams) {
  var userId = incomingParams.userId;
  if (!userId) return 'Missing userId';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/users/").concat(_utils["default"].encodeString(incomingParams.userId), "/spaces");
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var include = incomingParams.include,
      limit = incomingParams.limit,
      page = incomingParams.page,
      filter = incomingParams.filter;
  var params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    var includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    if (include.spaceFields) {
      includes.push('space');
    }

    if (include.customSpaceFields) {
      includes.push('space.custom');
    }

    var includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }

    if (page.prev) {
      params.end = page.prev;
    }
  }

  if (filter) {
    params.filter = filter;
  }

  return params;
}

function handleResponse(modules, membershipsResponse) {
  return membershipsResponse;
}
//# sourceMappingURL=get_memberships.js.map
