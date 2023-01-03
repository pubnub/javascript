"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
var endpoint = {
    getOperation: function () { return operations_1.default.PNHandshakeOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.channels) && !(params === null || params === void 0 ? void 0 : params.channelGroups)) {
            return 'channels and channleGroups both should not be empty';
        }
    },
    getURL: function (_a, params) {
        var config = _a.config;
        var channelsString = params.channels ? params.channels.join(',') : ',';
        return "/v2/subscribe/".concat(config.subscribeKey, "/").concat(utils_1.default.encodeString(channelsString), "/0");
    },
    getRequestTimeout: function (_a) {
        var config = _a.config;
        return config.getSubscribeTimeout();
    },
    isAuthSupported: function () { return true; },
    prepareParams: function (_, params) {
        var outParams = {};
        if (params.channelGroups && params.channelGroups.length > 0) {
            outParams['channel-group'] = params.channelGroups.join(',');
        }
        outParams.tt = 0;
        return outParams;
    },
    handleResponse: function (_, response) { return ({
        region: response.t.r,
        timetoken: response.t.t,
    }); },
};
exports.default = endpoint;
