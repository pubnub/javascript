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
        if (!(params === null || params === void 0 ? void 0 : params.id)) {
            return "file id can't be empty";
        }
        if (!(params === null || params === void 0 ? void 0 : params.name)) {
            return "file name can't be empty";
        }
    },
    useDelete: function () { return true; },
    getURL: function (_a, params) {
        var config = _a.config;
        return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(utils_1.default.encodeString(params.channel), "/files/").concat(params.id, "/").concat(params.name);
    },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function () { return ({}); },
    handleResponse: function (_, response) { return ({
        status: response.status,
    }); },
};
exports.default = endpoint;
