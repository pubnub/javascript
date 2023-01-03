"use strict";
/**       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
var preparePayload = function (_a, payload) {
    var crypto = _a.crypto, config = _a.config;
    var stringifiedPayload = JSON.stringify(payload);
    if (config.cipherKey) {
        stringifiedPayload = crypto.encrypt(stringifiedPayload);
        stringifiedPayload = JSON.stringify(stringifiedPayload);
    }
    return stringifiedPayload || '';
};
var endpoint = {
    getOperation: function () { return operations_1.default.PNPublishFileOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.channel)) {
            return "channel can't be empty";
        }
        if (!(params === null || params === void 0 ? void 0 : params.fileId)) {
            return "file id can't be empty";
        }
        if (!(params === null || params === void 0 ? void 0 : params.fileName)) {
            return "file name can't be empty";
        }
    },
    getURL: function (modules, params) {
        var _a = modules.config, publishKey = _a.publishKey, subscribeKey = _a.subscribeKey;
        var message = {
            message: params.message,
            file: {
                name: params.fileName,
                id: params.fileId,
            },
        };
        var payload = preparePayload(modules, message);
        return "/v1/files/publish-file/".concat(publishKey, "/").concat(subscribeKey, "/0/").concat(utils_1.default.encodeString(params.channel), "/0/").concat(utils_1.default.encodeString(payload));
    },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function (_, params) {
        var outParams = {};
        if (params.ttl) {
            outParams.ttl = params.ttl;
        }
        if (params.storeInHistory !== undefined) {
            outParams.store = params.storeInHistory ? '1' : '0';
        }
        if (params.meta && typeof params.meta === 'object') {
            outParams.meta = JSON.stringify(params.meta);
        }
        return outParams;
    },
    handleResponse: function (_, response) { return ({
        timetoken: response['2'],
    }); },
};
exports.default = endpoint;
