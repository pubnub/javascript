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

  if (endpoint.getOperation() === 'PNTimeOperation' || endpoint.getOperation() === 'PNChannelGroupsOperation') {
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

  if (endpoint.getOperation() === 'PNAccessManagerGrant') {
    var signInput = config.subscribeKey + '\n' + config.publishKey + '\ngrant\n';
    signInput += _utils2.default.signPamFromParams(outgoingParams);
    outgoingParams.signature = crypto.HMACSHA256(signInput);
  }

  if (endpoint.getOperation() === 'PNAccessManagerAudit') {
    var _signInput = config.subscribeKey + '\n' + config.publishKey + '\naudit\n';
    _signInput += _utils2.default.signPamFromParams(outgoingParams);
    outgoingParams.signature = crypto.HMACSHA256(_signInput);
  }

  var onResponse = function onResponse(status, payload) {
    if (callback) {
      if (status.error) return callback(status);

      callback(status, endpoint.handleResponse(modules, payload, incomingParams));
    }
  };

  var callInstance = void 0;

  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    var url = endpoint.postURL(modules, incomingParams);
    var networkingParams = { url: url,
      operation: endpoint.getOperation(),
      timeout: endpoint.getRequestTimeout(modules)
    };
    var payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
  } else {
    var _url = endpoint.getURL(modules, incomingParams);
    var _networkingParams = { url: _url,
      operation: endpoint.getOperation(),
      timeout: endpoint.getRequestTimeout(modules)
    };
    callInstance = networking.GET(outgoingParams, _networkingParams, onResponse);
  }

  if (endpoint.getOperation() === 'PNSubscribeOperation') {
    return callInstance;
  }
};

var _flow_interfaces = require('../flow_interfaces');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createError(errorPayload, type) {
  errorPayload.type = type;
  return errorPayload;
}

function createValidationError(message) {
  return createError({ message: message }, 'validationError');
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
