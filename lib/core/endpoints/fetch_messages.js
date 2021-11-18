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

var _flow_interfaces = require("../flow_interfaces");

var _operations = _interopRequireDefault(require("../constants/operations"));

var _utils = _interopRequireDefault(require("../utils"));

function __processMessage(modules, message) {
  var config = modules.config,
      crypto = modules.crypto;
  if (!config.cipherKey) return message;

  try {
    return crypto.decrypt(message);
  } catch (e) {
    return message;
  }
}

function getOperation() {
  return _operations["default"].PNFetchMessagesOperation;
}

function validateParams(modules, incomingParams) {
  var channels = incomingParams.channels,
      _incomingParams$inclu = incomingParams.includeMessageActions,
      includeMessageActions = _incomingParams$inclu === void 0 ? false : _incomingParams$inclu;
  var config = modules.config;
  if (!channels || channels.length === 0) return 'Missing channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (includeMessageActions && channels.length > 1) {
    throw new TypeError('History can return actions data for a single channel only. Either pass a single channel or disable the includeMessageActions flag.');
  }
}

function getURL(modules, incomingParams) {
  var _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann,
      _incomingParams$inclu2 = incomingParams.includeMessageActions,
      includeMessageActions = _incomingParams$inclu2 === void 0 ? false : _incomingParams$inclu2;
  var config = modules.config;
  var endpoint = !includeMessageActions ? 'history' : 'history-with-actions';
  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return "/v3/".concat(endpoint, "/sub-key/").concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(stringifiedChannels));
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var channels = incomingParams.channels,
      start = incomingParams.start,
      end = incomingParams.end,
      includeMessageActions = incomingParams.includeMessageActions,
      count = incomingParams.count,
      _incomingParams$strin = incomingParams.stringifiedTimeToken,
      stringifiedTimeToken = _incomingParams$strin === void 0 ? false : _incomingParams$strin,
      _incomingParams$inclu3 = incomingParams.includeMeta,
      includeMeta = _incomingParams$inclu3 === void 0 ? false : _incomingParams$inclu3,
      includeUuid = incomingParams.includeUuid,
      _incomingParams$inclu4 = incomingParams.includeUUID,
      includeUUID = _incomingParams$inclu4 === void 0 ? true : _incomingParams$inclu4,
      _incomingParams$inclu5 = incomingParams.includeMessageType,
      includeMessageType = _incomingParams$inclu5 === void 0 ? true : _incomingParams$inclu5;
  var outgoingParams = {};

  if (count) {
    outgoingParams.max = count;
  } else {
    outgoingParams.max = channels.length > 1 || includeMessageActions === true ? 25 : 100;
  }

  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';
  if (includeMeta) outgoingParams.include_meta = 'true';
  if (includeUUID && includeUuid !== false) outgoingParams.include_uuid = 'true';
  if (includeMessageType) outgoingParams.include_message_type = 'true';
  return outgoingParams;
}

function handleResponse(modules, serverResponse) {
  var response = {
    channels: {}
  };
  Object.keys(serverResponse.channels || {}).forEach(function (channelName) {
    response.channels[channelName] = [];
    (serverResponse.channels[channelName] || []).forEach(function (messageEnvelope) {
      var announce = {};
      announce.channel = channelName;
      announce.timetoken = messageEnvelope.timetoken;
      announce.message = __processMessage(modules, messageEnvelope.message);
      announce.messageType = messageEnvelope.message_type;
      announce.uuid = messageEnvelope.uuid;

      if (messageEnvelope.actions) {
        announce.actions = messageEnvelope.actions;
        announce.data = messageEnvelope.actions;
      }

      if (messageEnvelope.meta) {
        announce.meta = messageEnvelope.meta;
      }

      response.channels[channelName].push(announce);
    });
  });

  if (serverResponse.more) {
    response.more = serverResponse.more;
  }

  return response;
}
//# sourceMappingURL=fetch_messages.js.map
