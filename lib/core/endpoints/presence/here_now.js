"use strict";
/*       */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.handleResponse = exports.prepareParams = exports.isAuthSupported = exports.getRequestTimeout = exports.getURL = exports.validateParams = exports.getOperation = void 0;
var operations_1 = __importDefault(require("../../constants/operations"));
var utils_1 = __importDefault(require("../../utils"));
function getOperation() {
    return operations_1.default.PNHereNowOperation;
}
exports.getOperation = getOperation;
function validateParams(modules) {
    var config = modules.config;
    if (!config.subscribeKey)
        return 'Missing Subscribe Key';
}
exports.validateParams = validateParams;
function getURL(modules, incomingParams) {
    var config = modules.config;
    var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b;
    var baseURL = "/v2/presence/sub-key/".concat(config.subscribeKey);
    if (channels.length > 0 || channelGroups.length > 0) {
        var stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
        baseURL += "/channel/".concat(utils_1.default.encodeString(stringifiedChannels));
    }
    return baseURL;
}
exports.getURL = getURL;
function getRequestTimeout(_a) {
    var config = _a.config;
    return config.getTransactionTimeout();
}
exports.getRequestTimeout = getRequestTimeout;
function isAuthSupported() {
    return true;
}
exports.isAuthSupported = isAuthSupported;
function prepareParams(modules, incomingParams) {
    var _a = incomingParams.channelGroups, channelGroups = _a === void 0 ? [] : _a, _b = incomingParams.includeUUIDs, includeUUIDs = _b === void 0 ? true : _b, _c = incomingParams.includeState, includeState = _c === void 0 ? false : _c, _d = incomingParams.queryParameters, queryParameters = _d === void 0 ? {} : _d;
    var params = {};
    if (!includeUUIDs)
        params.disable_uuids = 1;
    if (includeState)
        params.state = 1;
    if (channelGroups.length > 0) {
        params['channel-group'] = channelGroups.join(',');
    }
    params = __assign(__assign({}, params), queryParameters);
    return params;
}
exports.prepareParams = prepareParams;
function handleResponse(modules, serverResponse, incomingParams) {
    var _a = incomingParams.channels, channels = _a === void 0 ? [] : _a, _b = incomingParams.channelGroups, channelGroups = _b === void 0 ? [] : _b, _c = incomingParams.includeUUIDs, includeUUIDs = _c === void 0 ? true : _c, _d = incomingParams.includeState, includeState = _d === void 0 ? false : _d;
    var prepareSingularChannel = function () {
        var response = {};
        var occupantsList = [];
        response.totalChannels = 1;
        response.totalOccupancy = serverResponse.occupancy;
        response.channels = {};
        response.channels[channels[0]] = {
            occupants: occupantsList,
            name: channels[0],
            occupancy: serverResponse.occupancy,
        };
        // We have had issues in the past with server returning responses
        // that contain no uuids array
        if (includeUUIDs && serverResponse.uuids) {
            serverResponse.uuids.forEach(function (uuidEntry) {
                if (includeState) {
                    occupantsList.push({ state: uuidEntry.state, uuid: uuidEntry.uuid });
                }
                else {
                    occupantsList.push({ state: null, uuid: uuidEntry });
                }
            });
        }
        return response;
    };
    var prepareMultipleChannel = function () {
        var response = {};
        response.totalChannels = serverResponse.payload.total_channels;
        response.totalOccupancy = serverResponse.payload.total_occupancy;
        response.channels = {};
        Object.keys(serverResponse.payload.channels).forEach(function (channelName) {
            var channelEntry = serverResponse.payload.channels[channelName];
            var occupantsList = [];
            response.channels[channelName] = {
                occupants: occupantsList,
                name: channelName,
                occupancy: channelEntry.occupancy,
            };
            if (includeUUIDs) {
                channelEntry.uuids.forEach(function (uuidEntry) {
                    if (includeState) {
                        occupantsList.push({
                            state: uuidEntry.state,
                            uuid: uuidEntry.uuid,
                        });
                    }
                    else {
                        occupantsList.push({ state: null, uuid: uuidEntry });
                    }
                });
            }
            return response;
        });
        return response;
    };
    var response;
    if (channels.length > 1 || channelGroups.length > 0 || (channelGroups.length === 0 && channels.length === 0)) {
        response = prepareMultipleChannel();
    }
    else {
        response = prepareSingularChannel();
    }
    return response;
}
exports.handleResponse = handleResponse;
function handleError(modules, params, status) {
    if (status.statusCode === 402 && !this.getURL(modules, params).includes('channel')) {
        status.errorData.message =
            'You have tried to perform a Global Here Now operation, ' +
                'your keyset configuration does not support that. Please provide a channel, ' +
                'or enable the Global Here Now feature from the Portal.';
    }
}
exports.handleError = handleError;
