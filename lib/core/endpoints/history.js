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

function __processMessage(modules, message) {
  var config = modules.config;
  var crypto = modules.crypto;

  if (!config.cipherKey) return message;

  try {
    return crypto.decrypt(message);
  } catch (e) {
    return message;
  }
}

function getOperation() {
  return 'PNHistoryOperation';
}

function validateParams(modules, incomingParams) {
  var channel = incomingParams.channel;
  var config = modules.config;


  if (!channel) return 'Missing channel';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules, incomingParams) {
  var channel = incomingParams.channel;
  var config = modules.config;

  return '/v2/history/sub-key/' + config.subscribeKey + '/channel/' + encodeURIComponent(channel);
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var start = incomingParams.start;
  var end = incomingParams.end;
  var includeTimetoken = incomingParams.includeTimetoken;
  var reverse = incomingParams.reverse;
  var _incomingParams$count = incomingParams.count;
  var count = _incomingParams$count === undefined ? 100 : _incomingParams$count;

  var outgoingParams = {};

  outgoingParams.count = count;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (includeTimetoken != null) outgoingParams.include_token = includeTimetoken.toString();
  if (reverse != null) outgoingParams.reverse = reverse.toString();

  return outgoingParams;
}

function handleResponse(modules, serverResponse) {
  var response = {
    messages: [],
    startTimeToken: parseInt(serverResponse[1], 10),
    endTimeToken: parseInt(serverResponse[2], 10)
  };

  serverResponse[0].forEach(function (serverHistoryItem) {
    var item = {
      timetoken: null,
      entry: null
    };

    if (serverHistoryItem.timetoken) {
      item.timetoken = serverHistoryItem.timetoken;
      item.entry = __processMessage(modules, serverHistoryItem.message);
    } else {
      item.entry = __processMessage(modules, serverHistoryItem);
    }

    response.messages.push(item);
  });

  return response;
}
//# sourceMappingURL=history.js.map
