"use strict";
/**       */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
var endpoint = {
    getOperation: function () { return operations_1.default.PNGenerateUploadUrlOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.channel)) {
            return "channel can't be empty";
        }
        if (!(params === null || params === void 0 ? void 0 : params.name)) {
            return "name can't be empty";
        }
    },
    usePost: function () { return true; },
    postURL: function (_a, params) {
        var config = _a.config;
        return "/v1/files/".concat(config.subscribeKey, "/channels/").concat(utils_1.default.encodeString(params.channel), "/generate-upload-url");
    },
    postPayload: function (_, params) { return ({
        name: params.name,
    }); },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function () { return ({}); },
    handleResponse: function (_, response) { return ({
        status: response.status,
        data: response.data,
        file_upload_request: response.file_upload_request,
    }); },
};
exports.default = endpoint;
