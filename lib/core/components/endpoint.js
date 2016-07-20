'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (modules, endpoint) {
  var networking = modules.networking;
  var config = modules.config;

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

  var url = endpoint.getURL(modules, incomingParams);
  var outgoingParams = endpoint.prepareParams(modules, incomingParams);

  outgoingParams.uuid = config.UUID;

  Object.keys(config.baseParams).forEach(function (key) {
    var value = config.baseParams[key];
    if (!(key in outgoingParams)) outgoingParams[key] = value;
  });

  if (config.useInstanceId) {
    outgoingParams.instanceid = config.instanceId;
  }

  if (config.useRequestId) {
    outgoingParams.requestid = _uuid2.default.v4();
  }

  networking.GET(outgoingParams, { url: url }, function (status, payload) {
    if (status.error) return callback(status);

    callback(status, endpoint.handleResponse(modules, payload));
  });
};

var _flow_interfaces = require('../flow_interfaces');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createError(errorPayload, type) {
  errorPayload.type = type;
  return errorPayload;
}

function createValidationError(message) {
  return createError({ message: message }, 'validationError');
}

module.exports = exports['default'];
//# sourceMappingURL=endpoint.js.map
