"use strict";
/*       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.handleResponse = exports.isAuthSupported = exports.prepareParams = exports.getRequestTimeout = exports.getURL = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../constants/operations"));
function getOperation() {
    return operations_1.default.PNTimeOperation;
}
exports.getOperation = getOperation;
function getURL() {
    return '/time/0';
}
exports.getURL = getURL;
function getRequestTimeout(_a) {
    var config = _a.config;
    return config.getTransactionTimeout();
}
exports.getRequestTimeout = getRequestTimeout;
function prepareParams() {
    return {};
}
exports.prepareParams = prepareParams;
function isAuthSupported() {
    return false;
}
exports.isAuthSupported = isAuthSupported;
function handleResponse(modules, serverResponse) {
    return {
        timetoken: serverResponse[0],
    };
}
exports.handleResponse = handleResponse;
function validateParams() {
    // pass
}
exports.validateParams = validateParams;
