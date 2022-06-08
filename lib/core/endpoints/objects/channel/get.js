"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../../constants/operations"));
var utils_1 = __importDefault(require("../../../utils"));
var endpoint = {
    getOperation: function () { return operations_1.default.PNGetChannelMetadataOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.channel)) {
            return 'Channel cannot be empty';
        }
    },
    getURL: function (_a, params) {
        var config = _a.config;
        return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(utils_1.default.encodeString(params.channel));
    },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function (_, params) {
        var _a;
        var queryParams = {};
        queryParams.include = ['status', 'type', 'custom'];
        if (params === null || params === void 0 ? void 0 : params.include) {
            if (((_a = params.include) === null || _a === void 0 ? void 0 : _a.customFields) === false) {
                queryParams.include.pop();
            }
        }
        queryParams.include = queryParams.include.join(',');
        return queryParams;
    },
    handleResponse: function (_, response) { return ({
        status: response.status,
        data: response.data,
    }); },
};
exports.default = endpoint;
