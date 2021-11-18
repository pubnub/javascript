"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractPermissions = extractPermissions;
exports.getOperation = getOperation;
exports.getRequestTimeout = getRequestTimeout;
exports.handleResponse = handleResponse;
exports.isAuthSupported = isAuthSupported;
exports.postPayload = postPayload;
exports.postURL = postURL;
exports.prepareParams = prepareParams;
exports.usePost = usePost;
exports.validateParams = validateParams;

var _flow_interfaces = require("../../flow_interfaces");

var _operations = _interopRequireDefault(require("../../constants/operations"));

function getOperation() {
  return _operations["default"].PNAccessManagerGrantToken;
}

function extractPermissions(permissions) {
  var permissionsResult = 0;

  if (permissions.join) {
    permissionsResult |= 128;
  }

  if (permissions.update) {
    permissionsResult |= 64;
  }

  if (permissions.get) {
    permissionsResult |= 32;
  }

  if (permissions["delete"]) {
    permissionsResult |= 8;
  }

  if (permissions.manage) {
    permissionsResult |= 4;
  }

  if (permissions.write) {
    permissionsResult |= 2;
  }

  if (permissions.read) {
    permissionsResult |= 1;
  }

  return permissionsResult;
}

function prepareMessagePayload(modules, incomingParams) {
  var ttl = incomingParams.ttl,
      resources = incomingParams.resources,
      patterns = incomingParams.patterns,
      meta = incomingParams.meta,
      authorized_uuid = incomingParams.authorized_uuid;
  var params = {
    ttl: 0,
    permissions: {
      resources: {
        channels: {},
        groups: {},
        uuids: {},
        users: {},
        spaces: {}
      },
      patterns: {
        channels: {},
        groups: {},
        uuids: {},
        users: {},
        spaces: {}
      },
      meta: {}
    }
  };

  if (resources) {
    var uuids = resources.uuids,
        channels = resources.channels,
        groups = resources.groups;

    if (uuids) {
      Object.keys(uuids).forEach(function (uuid) {
        params.permissions.resources.uuids[uuid] = extractPermissions(uuids[uuid]);
      });
    }

    if (channels) {
      Object.keys(channels).forEach(function (channel) {
        params.permissions.resources.channels[channel] = extractPermissions(channels[channel]);
      });
    }

    if (groups) {
      Object.keys(groups).forEach(function (group) {
        params.permissions.resources.groups[group] = extractPermissions(groups[group]);
      });
    }
  }

  if (patterns) {
    var _uuids = patterns.uuids,
        _channels = patterns.channels,
        _groups = patterns.groups;

    if (_uuids) {
      Object.keys(_uuids).forEach(function (uuid) {
        params.permissions.patterns.uuids[uuid] = extractPermissions(_uuids[uuid]);
      });
    }

    if (_channels) {
      Object.keys(_channels).forEach(function (channel) {
        params.permissions.patterns.channels[channel] = extractPermissions(_channels[channel]);
      });
    }

    if (_groups) {
      Object.keys(_groups).forEach(function (group) {
        params.permissions.patterns.groups[group] = extractPermissions(_groups[group]);
      });
    }
  }

  if (ttl || ttl === 0) {
    params.ttl = ttl;
  }

  if (meta) {
    params.permissions.meta = meta;
  }

  if (authorized_uuid) {
    params.permissions.uuid = "".concat(authorized_uuid);
  }

  return params;
}

function validateParams(modules, incomingParams) {
  var config = modules.config;
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!config.publishKey) return 'Missing Publish Key';
  if (!config.secretKey) return 'Missing Secret Key';
  if (!incomingParams.resources && !incomingParams.patterns) return 'Missing either Resources or Patterns.';

  if (incomingParams.resources && (!incomingParams.resources.uuids || Object.keys(incomingParams.resources.uuids).length === 0) && (!incomingParams.resources.channels || Object.keys(incomingParams.resources.channels).length === 0) && (!incomingParams.resources.groups || Object.keys(incomingParams.resources.groups).length === 0) || incomingParams.patterns && (!incomingParams.patterns.uuids || Object.keys(incomingParams.patterns.uuids).length === 0) && (!incomingParams.patterns.channels || Object.keys(incomingParams.patterns.channels).length === 0) && (!incomingParams.patterns.groups || Object.keys(incomingParams.patterns.groups).length === 0)) {
    return 'Missing values for either Resources or Patterns.';
  }
}

function postURL(modules) {
  var config = modules.config;
  return "/v3/pam/".concat(config.subscribeKey, "/grant");
}

function usePost() {
  return true;
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return false;
}

function prepareParams() {
  return {};
}

function postPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

function handleResponse(modules, response) {
  var token = response.data.token;
  return token;
}
//# sourceMappingURL=grant_token.js.map
