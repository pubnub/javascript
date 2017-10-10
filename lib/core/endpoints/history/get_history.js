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

var _flow_interfaces = require('../../flow_interfaces');

var _operations = require('../../constants/operations');

var _operations2 = _interopRequireDefault(_operations);

var _utils = require('../../utils');

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
  return _operations2.default.PNHistoryOperation;
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

  return '/v2/history/sub-key/' + config.subscribeKey + '/channel/' + _utils2.default.encodeString(channel);
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
      reverse = incomingParams.reverse,
      _incomingParams$count = incomingParams.count,
      count = _incomingParams$count === undefined ? 100 : _incomingParams$count,
      _incomingParams$strin = incomingParams.stringifiedTimeToken,
      stringifiedTimeToken = _incomingParams$strin === undefined ? false : _incomingParams$strin;

  var outgoingParams = {
    include_token: 'true'
  };

  outgoingParams.count = count;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';
  if (reverse != null) outgoingParams.reverse = reverse.toString();

  return outgoingParams;
}

function handleResponse(modules, serverResponse) {
  var response = {
    messages: [],
    startTimeToken: serverResponse[1],
    endTimeToken: serverResponse[2]
  };

  serverResponse[0].forEach(function (serverHistoryItem) {
    var item = {
      timetoken: serverHistoryItem.timetoken,
      entry: __processMessage(modules, serverHistoryItem.message)
    };

    response.messages.push(item);
  });

  return response;
}
//# sourceMappingURL=get_history.js.map
