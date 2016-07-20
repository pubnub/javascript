'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOperation = getOperation;
exports.getURL = getURL;
exports.prepareParams = prepareParams;
exports.handleResponse = handleResponse;
exports.validateParams = validateParams;

var _flow_interfaces = require('../flow_interfaces');

function getOperation() {
  return 'PNTimeOperation';
}

function getURL() {
  return '/time/0';
}

function prepareParams() {
  return {};
}

function handleResponse(params, serverResponse) {
  return {
    timetoken: serverResponse[0]
  };
}

function validateParams() {}
//# sourceMappingURL=time.js.map
