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

var _flow_interfaces = require("../../flow_interfaces");

var _operations = _interopRequireDefault(require("../../constants/operations"));

var _utils = _interopRequireDefault(require("../../utils"));

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
  return _operations["default"].PNHistoryOperation;
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
  return "/v2/history/sub-key/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(channel));
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
      count = _incomingParams$count === void 0 ? 100 : _incomingParams$count,
      _incomingParams$strin = incomingParams.stringifiedTimeToken,
      stringifiedTimeToken = _incomingParams$strin === void 0 ? false : _incomingParams$strin,
      _incomingParams$inclu = incomingParams.includeMeta,
      includeMeta = _incomingParams$inclu === void 0 ? false : _incomingParams$inclu;
  var outgoingParams = {
    include_token: 'true'
  };
  outgoingParams.count = count;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';
  if (reverse != null) outgoingParams.reverse = reverse.toString();
  if (includeMeta) outgoingParams.include_meta = 'true';
  return outgoingParams;
}

function handleResponse(modules, serverResponse) {
  var response = {
    messages: [],
    startTimeToken: serverResponse[1],
    endTimeToken: serverResponse[2]
  };

  if (Array.isArray(serverResponse[0])) {
    serverResponse[0].forEach(function (serverHistoryItem) {
      var item = {
        timetoken: serverHistoryItem.timetoken,
        entry: __processMessage(modules, serverHistoryItem.message)
      };

      if (serverHistoryItem.meta) {
        item.meta = serverHistoryItem.meta;
      }

      response.messages.push(item);
    });
  }

  return response;
}
//# sourceMappingURL=get_history.js.map
