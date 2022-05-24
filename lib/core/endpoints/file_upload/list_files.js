"use strict";
/**       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
var endpoint = {
    getOperation: function () { return operations_1.default.PNListFilesOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.channel)) {
            return "channel can't be empty";
        }
    },
    getURL: function (_a, params) {
        var config = _a.config;
        return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(utils_1.default.encodeString(params.channel), "/files");
    },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function (_, params) {
        var outParams = {};
        if (params.limit) {
            outParams.limit = params.limit;
        }
        if (params.next) {
            outParams.next = params.next;
        }
        return outParams;
    },
    handleResponse: function (_, response) { return ({
        status: response.status,
        data: response.data,
        next: response.next,
        count: response.count,
    }); },
};
exports.default = endpoint;
