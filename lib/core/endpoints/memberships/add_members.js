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
exports.patchPayload = patchPayload;
exports.patchURL = patchURL;
exports.prepareParams = prepareParams;
exports.usePatch = usePatch;
exports.validateParams = validateParams;

var _flow_interfaces = require("../../flow_interfaces");

var _operations = _interopRequireDefault(require("../../constants/operations"));

var _utils = _interopRequireDefault(require("../../utils"));

function prepareMessagePayload(modules, incomingParams) {
  var users = incomingParams.users;
  var payload = {};

  if (users && users.length > 0) {
    payload.add = [];
    users.forEach(function (addMember) {
      var currentAdd = {
        id: addMember.id
      };

      if (addMember.custom) {
        currentAdd.custom = addMember.custom;
      }

      payload.add.push(currentAdd);
    });
  }

  return payload;
}

function getOperation() {
  return _operations["default"].PNUpdateMembersOperation;
}

function validateParams(modules, incomingParams) {
  var spaceId = incomingParams.spaceId,
      users = incomingParams.users;
  if (!spaceId) return 'Missing spaceId';
  if (!users) return 'Missing users';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(_utils["default"].encodeString(incomingParams.spaceId), "/users");
}

function patchURL(modules, incomingParams) {
  var config = modules.config;
  return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(_utils["default"].encodeString(incomingParams.spaceId), "/users");
}

function usePatch() {
  return true;
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
      page = incomingParams.page;
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

  return params;
}

function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, membersResponse) {
  return membersResponse;
}
//# sourceMappingURL=add_members.js.map
