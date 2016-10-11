'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (modules, endpoint) {
  var networking = modules.networking;
  var config = modules.config;
  var crypto = modules.crypto;

  var callback = null;
  var incomingParams = {};

  if (endpoint.getOperation() === _operations2.default.PNTimeOperation || endpoint.getOperation() === _operations2.default.PNChannelGroupsOperation) {
    callback = arguments.length <= 2 ? undefined : arguments[2];
  } else {
    incomingParams = arguments.length <= 2 ? undefined : arguments[2];
    callback = arguments.length <= 3 ? undefined : arguments[3];
  }

  var validationResult = endpoint.validateParams(modules, incomingParams);

  if (validationResult) {
    callback(createValidationError(validationResult));
    return;
  }

  var outgoingParams = endpoint.prepareParams(modules, incomingParams);
  var url = decideURL(endpoint, modules, incomingParams);
  var callInstance = void 0;
  var networkingParams = { url: url,
    operation: endpoint.getOperation(),
    timeout: endpoint.getRequestTimeout(modules)
  };

  outgoingParams.uuid = config.UUID;
  outgoingParams.pnsdk = generatePNSDK(config);

  if (config.useInstanceId) {
    outgoingParams.instanceid = config.instanceId;
  }

  if (config.useRequestId) {
    outgoingParams.requestid = _uuid2.default.v4();
  }

  if (endpoint.isAuthSupported() && config.getAuthKey()) {
    outgoingParams.auth = config.getAuthKey();
  }

  if (config.secretKey) {
    outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);
    var signInput = config.subscribeKey + '\n' + config.publishKey + '\n';

    if (endpoint.getOperation() === _operations2.default.PNAccessManagerGrant) {
      signInput += 'grant\n';
    } else if (endpoint.getOperation() === _operations2.default.PNAccessManagerAudit) {
      signInput += 'audit\n';
    } else {
      signInput += url + '\n';
    }

    signInput += _utils2.default.signPamFromParams(outgoingParams);
    outgoingParams.signature = crypto.HMACSHA256(signInput);
  }

  var onResponse = function onResponse(status, payload) {
    if (callback) {
      if (status.error) return callback(status);

      callback(status, endpoint.handleResponse(modules, payload, incomingParams));
    }
  };

  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    var payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
  } else {
    callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
  }

  if (endpoint.getOperation() === _operations2.default.PNSubscribeOperation) {
    return callInstance;
  }
};

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _flow_interfaces = require('../flow_interfaces');

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _operations = require('../constants/operations');

var _operations2 = _interopRequireDefault(_operations);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createError(errorPayload, type) {
  errorPayload.type = type;
  return errorPayload;
}

function createValidationError(message) {
  return createError({ message: message }, 'validationError');
}

function decideURL(endpoint, modules, incomingParams) {
  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    return endpoint.postURL(modules, incomingParams);
  } else {
    return endpoint.getURL(modules, incomingParams);
  }
}

function generatePNSDK(config) {
  var base = 'PubNub-JS-' + config.sdkFamily;

  if (config.partnerId) {
    base += '-' + config.partnerId;
  }

  base += '/' + config.getVersion();

  return base;
}

module.exports = exports['default'];
//# sourceMappingURL=endpoint.js.map
