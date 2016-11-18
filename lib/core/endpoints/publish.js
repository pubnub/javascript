'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.getOperation = getOperation;
exports.validateParams = validateParams;
exports.usePost = usePost;
exports.getURL = getURL;
exports.postURL = postURL;
exports.getRequestTimeout = getRequestTimeout;
exports.isAuthSupported = isAuthSupported;
exports.postPayload = postPayload;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;

var _flow_interfaces = require('../flow_interfaces');

var _operations = require('../constants/operations');

var _operations2 = _interopRequireDefault(_operations);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prepareMessagePayload(modules, messagePayload) {
  var crypto = modules.crypto,
      config = modules.config;

  var stringifiedPayload = JSON.stringify(messagePayload);

  if (config.cipherKey) {
    stringifiedPayload = crypto.encrypt(stringifiedPayload);
    stringifiedPayload = JSON.stringify(stringifiedPayload);
  }

  return stringifiedPayload;
}

function getOperation() {
  return _operations2.default.PNPublishOperation;
}

function validateParams(_ref, incomingParams) {
  var config = _ref.config;
  var message = incomingParams.message,
      channel = incomingParams.channel;


  if (!channel) return 'Missing Channel';
  if (!message) return 'Missing Message';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function usePost(modules, incomingParams) {
  var _incomingParams$sendB = incomingParams.sendByPost,
      sendByPost = _incomingParams$sendB === undefined ? false : _incomingParams$sendB;

  return sendByPost;
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var channel = incomingParams.channel,
      message = incomingParams.message;

  var stringifiedPayload = prepareMessagePayload(modules, message);
  return '/publish/' + config.publishKey + '/' + config.subscribeKey + '/0/' + _utils2.default.encodeString(channel) + '/0/' + _utils2.default.encodeString(stringifiedPayload);
}

function postURL(modules, incomingParams) {
  var config = modules.config;
  var channel = incomingParams.channel;

  return '/publish/' + config.publishKey + '/' + config.subscribeKey + '/0/' + _utils2.default.encodeString(channel) + '/0';
}

function getRequestTimeout(_ref2) {
  var config = _ref2.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function postPayload(modules, incomingParams) {
  var message = incomingParams.message;

  return prepareMessagePayload(modules, message);
}

function prepareParams(modules, incomingParams) {
  var meta = incomingParams.meta,
      _incomingParams$repli = incomingParams.replicate,
      replicate = _incomingParams$repli === undefined ? true : _incomingParams$repli,
      storeInHistory = incomingParams.storeInHistory,
      ttl = incomingParams.ttl;

  var params = {};

  if (storeInHistory != null) {
    if (storeInHistory) {
      params.store = '1';
    } else {
      params.store = '0';
    }
  }

  if (ttl) {
    params.ttl = ttl;
  }

  if (replicate === false) {
    params.norep = 'true';
  }

  if (meta && (typeof meta === 'undefined' ? 'undefined' : _typeof(meta)) === 'object') {
    params.meta = JSON.stringify(meta);
  }

  return params;
}

function handleResponse(modules, serverResponse) {
  return { timetoken: serverResponse[2] };
}
//# sourceMappingURL=publish.js.map
