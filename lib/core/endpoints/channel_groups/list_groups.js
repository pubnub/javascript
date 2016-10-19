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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getOperation() {
  return _operations2.default.PNChannelGroupsOperation;
}

function validateParams(modules) {
  var config = modules.config;


  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

function getURL(modules) {
  var config = modules.config;

  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group';
}

function getRequestTimeout(_ref) {
  var config = _ref.config;

  return config.getTransactionTimeout();
}

function isAuthSupported() {
  return true;
}

function prepareParams() {
  return {};
}

function handleResponse(modules, serverResponse) {
  return {
    groups: serverResponse.payload.groups
  };
}
//# sourceMappingURL=list_groups.js.map
