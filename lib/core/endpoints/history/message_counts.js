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

var _operations = require('../../constants/operations');

var _operations2 = _interopRequireDefault(_operations);

var _utils = require('../../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getOperation() {
  return _operations2.default.PNMessageCounts;
}

function validateParams(modules, incomingParams) {
  var channels = incomingParams.channels,
      timetoken = incomingParams.timetoken,
      channelTimetokens = incomingParams.channelTimetokens;
  var config = modules.config;


  if (!channels) return 'Missing channel';
  if (timetoken && channelTimetokens) return 'timetoken and channelTimetokens are incompatible together';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var channels = incomingParams.channels;
  var config = modules.config;


  var stringifiedChannels = channels.join(',');

  return '/v3/history/sub-key/' + config.subscribeKey + '/message-counts/' + _utils2.default.encodeString(stringifiedChannels);
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var timetoken = incomingParams.timetoken,
      channelTimetokens = incomingParams.channelTimetokens;

  var outgoingParams = {};

  if (timetoken) outgoingParams.timetoken = timetoken;
  if (channelTimetokens) outgoingParams.channelTimetokens = _utils2.default.encodeString(channelTimetokens.join(','));

  return outgoingParams;
}

function handleResponse(modules, serverResponse) {

  return { channels: serverResponse.channels };
}
//# sourceMappingURL=message_counts.js.map
