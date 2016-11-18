'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.getURL = getURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = require('../flow_interfaces');

var _operations = require('../constants/operations');

var _operations2 = _interopRequireDefault(_operations);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  return _operations2.default.PNFetchMessagesOperation;
}

function validateParams(modules, incomingParams) {
  var channels = incomingParams.channels;
  var config = modules.config;


  if (!channels || channels.length === 0) return 'Missing channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === undefined ? [] : _incomingParams$chann;
  var config = modules.config;


  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return '/v3/history/sub-key/' + config.subscribeKey + '/channel/' + _utils2.default.encodeString(stringifiedChannels);
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var start = incomingParams.start,
      end = incomingParams.end,
      count = incomingParams.count;

  var outgoingParams = {};

  if (count) outgoingParams.max = count;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;

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
      announce.subscription = null;
      announce.timetoken = messageEnvelope.timetoken;
      announce.message = __processMessage(modules, messageEnvelope.message);
      response.channels[channelName].push(announce);
    });
  });

  return response;
}
//# sourceMappingURL=fetch_messages.js.map
