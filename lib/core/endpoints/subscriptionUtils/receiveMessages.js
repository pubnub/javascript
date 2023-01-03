"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
var endpoint = {
    getOperation: function () { return operations_1.default.PNReceiveMessagesOperation; },
    validateParams: function (_, params) {
        if (!(params === null || params === void 0 ? void 0 : params.channels) && !(params === null || params === void 0 ? void 0 : params.channelGroups)) {
            return 'channels and channleGroups both should not be empty';
        }
        if (!(params === null || params === void 0 ? void 0 : params.timetoken)) {
            return 'timetoken can not be empty';
        }
        if (!(params === null || params === void 0 ? void 0 : params.region)) {
            return 'region can not be empty';
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
    getAbortSignal: function (_, params) { return params.abortSignal; },
    prepareParams: function (_, params) {
        var outParams = {};
        if (params.channelGroups && params.channelGroups.length > 0) {
            outParams['channel-group'] = params.channelGroups.join(',');
        }
        outParams.tt = params.timetoken;
        outParams.tr = params.region;
        return outParams;
    },
    handleResponse: function (_, response) {
        var parsedMessages = [];
        response.m.forEach(function (envelope) {
            var parsedMessage = {
                shard: parseInt(envelope.a, 10),
                subscriptionMatch: envelope.b,
                channel: envelope.c,
                messageType: envelope.e,
                payload: envelope.d,
                flags: envelope.f,
                issuingClientId: envelope.i,
                subscribeKey: envelope.k,
                originationTimetoken: envelope.o,
                publishMetaData: {
                    timetoken: envelope.p.t,
                    region: envelope.p.r,
                },
            };
            parsedMessages.push(parsedMessage);
        });
        return {
            messages: parsedMessages,
            metadata: {
                region: response.t.r,
                timetoken: response.t.t,
            },
        };
    },
};
exports.default = endpoint;
