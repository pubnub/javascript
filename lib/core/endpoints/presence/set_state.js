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

function getOperation() {
  return _operations["default"].PNSetStateOperation;
}

function validateParams(modules, incomingParams) {
  var config = modules.config;
  var state = incomingParams.state,
      _incomingParams$chann = incomingParams.channels,
      channels = _incomingParams$chann === void 0 ? [] : _incomingParams$chann,
      _incomingParams$chann2 = incomingParams.channelGroups,
      channelGroups = _incomingParams$chann2 === void 0 ? [] : _incomingParams$chann2;
  if (!state) return 'Missing State';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (channels.length === 0 && channelGroups.length === 0) return 'Please provide a list of channels and/or channel-groups';
}

function getURL(modules, incomingParams) {
  var config = modules.config;
  var _incomingParams$chann3 = incomingParams.channels,
      channels = _incomingParams$chann3 === void 0 ? [] : _incomingParams$chann3;
  var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return "/v2/presence/sub-key/".concat(config.subscribeKey, "/channel/").concat(_utils["default"].encodeString(stringifiedChannels), "/uuid/").concat(_utils["default"].encodeString(config.UUID), "/data");
}

function getRequestTimeout(_ref) {
  var config = _ref.config;
  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams(modules, incomingParams) {
  var state = incomingParams.state,
      _incomingParams$chann4 = incomingParams.channelGroups,
      channelGroups = _incomingParams$chann4 === void 0 ? [] : _incomingParams$chann4;
  var params = {};
  params.state = JSON.stringify(state);

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  return params;
}

function handleResponse(modules, serverResponse) {
  return {
    state: serverResponse.payload
  };
}
//# sourceMappingURL=set_state.js.map
