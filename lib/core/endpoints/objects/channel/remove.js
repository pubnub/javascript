"use strict";
/**       */
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = require("../../../constants/operations");
var utils_1 = require("../../../utils");
var endpoint = {
    getOperation: function () { return operations_1.default.PNRemoveChannelMetadataOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.channel)) {
            return 'Channel cannot be empty';
        }
    },
    getURL: function (_a, params) {
        var config = _a.config;
        return "/v2/objects/".concat(config.subscribeKey, "/channels/").concat(utils_1.default.encodeString(params.channel));
    },
    useDelete: function () { return true; },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getTransactionTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function () { return ({}); },
    handleResponse: function (_, response) { return ({
        status: response.status,
        data: response.data,
    }); },
};
exports.default = endpoint;
