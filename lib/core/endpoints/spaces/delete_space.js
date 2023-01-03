"use strict";
/*       */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.useDelete = exports.validateParams = exports.getOperation = void 0;
var operations_1 = require("../../constants/operations");
var utils_1 = require("../../utils");
function getOperation() {
    return operations_1.default.PNDeleteSpaceOperation;
}
exports.getOperation = getOperation;
function validateParams(_a, spaceId) {
    var config = _a.config;
    if (!spaceId)
        return 'Missing SpaceId';
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function useDelete() {
    return true;
}
exports.useDelete = useDelete;
function getURL(modules, spaceId) {
    var config = modules.config;
    return "/v1/objects/".concat(config.subscribeKey, "/spaces/").concat(utils_1.default.encodeString(spaceId));
}
exports.getURL = getURL;
function getRequestTimeout(_a) {
    var config = _a.config;
    return config.getTransactionTimeout();
}
exports.getRequestTimeout = getRequestTimeout;
function isAuthSupported() {
    return true;
}
exports.isAuthSupported = isAuthSupported;
function prepareParams() {
    return {};
}
exports.prepareParams = prepareParams;
function handleResponse(modules, spacesResponse) {
    return spacesResponse;
}
exports.handleResponse = handleResponse;
