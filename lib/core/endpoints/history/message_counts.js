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

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _operations = _interopRequireDefault(require("../../constants/operations"));

var _utils = _interopRequireDefault(require("../../utils"));

function getOperation() {
  return _operations["default"].PNMessageCounts;
}

function validateParams(modules, incomingParams) {
  var channels = incomingParams.channels,
      timetoken = incomingParams.timetoken,
      channelTimetokens = incomingParams.channelTimetokens;
  var config = modules.config;
  if (!channels) return 'Missing channel';
  if (timetoken && channelTimetokens) return 'timetoken and channelTimetokens are incompatible together';
  if (timetoken && channelTimetokens && channelTimetokens.length > 1 && channels.length !== channelTimetokens.length) return 'Length of channelTimetokens and channels do not match';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var channels = incomingParams.channels;
  var config = modules.config;
  var stringifiedChannels = channels.join(',');
  return "/v3/history/sub-key/".concat(config.subscribeKey, "/message-counts/").concat(_utils["default"].encodeString(stringifiedChannels));
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

  if (channelTimetokens && channelTimetokens.length === 1) {
    var _channelTimetokens = (0, _slicedToArray2["default"])(channelTimetokens, 1),
        tt = _channelTimetokens[0];

    outgoingParams.timetoken = tt;
  } else if (channelTimetokens) {
    outgoingParams.channelsTimetoken = channelTimetokens.join(',');
  } else if (timetoken) {
    outgoingParams.timetoken = timetoken;
  }

  return outgoingParams;
}

function handleResponse(modules, serverResponse) {
  return {
    channels: serverResponse.channels
  };
}
//# sourceMappingURL=message_counts.js.map
