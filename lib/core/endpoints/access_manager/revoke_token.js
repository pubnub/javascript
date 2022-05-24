"use strict";
/**       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
var endpoint = {
    getOperation: function () { return operations_1.default.PNAccessManagerRevokeToken; },
    validateParams: function (modules, token) {
        var secretKey = modules.config.secretKey;
        if (!secretKey) {
            return 'Missing Secret Key';
        }
        if (!token) {
            return "token can't be empty";
        }
    },
    getURL: function (_a, token) {
        var config = _a.config;
        return "/v3/pam/".concat(config.subscribeKey, "/grant/").concat(utils_1.default.encodeString(token));
    },
    useDelete: function () { return true; },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return false; },
    prepareParams: function (_a) {
        var config = _a.config;
        return ({
            uuid: config.getUUID(),
        });
    },
    handleResponse: function (_, response) { return ({
        status: response.status,
        data: response.data,
    }); },
};
exports.default = endpoint;
