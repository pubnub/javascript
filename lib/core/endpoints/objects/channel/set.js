"use strict";
/**       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../../constants/operations"));
var utils_1 = __importDefault(require("../../../utils"));
var endpoint = {
    getOperation: function () { return operations_1.default.PNSetChannelMetadataOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.channel)) {
            return 'Channel cannot be empty';
        }
        if (!(params === null || params === void 0 ? void 0 : params.data)) {
            return 'Data cannot be empty';
        }
    },
    usePatch: function () { return true; },
    patchURL: function (_a, params) {
        var config = _a.config;
        return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(utils_1.default.encodeString(params.channel));
    },
    patchPayload: function (_, params) { return params.data; },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function (_, params) {
        var _a, _b, _c;
        var queryParams = {};
        queryParams.include = [];
        queryParams.include.push('custom');
        if (params === null || params === void 0 ? void 0 : params.include) {
            if (((_a = params.include) === null || _a === void 0 ? void 0 : _a.customFields) === false) {
                queryParams.include.pop();
            }
            if ((_b = params === null || params === void 0 ? void 0 : params.include) === null || _b === void 0 ? void 0 : _b.status) {
                queryParams.include.push('status');
            }
            if ((_c = params === null || params === void 0 ? void 0 : params.include) === null || _c === void 0 ? void 0 : _c.type) {
                queryParams.include.push('type');
            }
            queryParams.include = queryParams.include.join(',');
        }
        return queryParams;
    },
    handleResponse: function (_, response) { return ({
        status: response.status,
        data: response.data,
    }); },
};
exports.default = endpoint;
