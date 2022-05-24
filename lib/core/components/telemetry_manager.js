"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*       */
var operations_1 = __importDefault(require("../constants/operations"));
var default_1 = /** @class */ (function () {
    function default_1(configuration) {
        this._maximumSamplesCount = 100;
        this._trackedLatencies = {};
        this._latencies = {};
        this._maximumSamplesCount = configuration.maximumSamplesCount || this._maximumSamplesCount;
    }
    /**
     * Compose object with latency information of recently used API endpoints.
     *
     * @return {Object} Object with request query key/value pairs.
     */
    default_1.prototype.operationsLatencyForRequest = function () {
        var _this = this;
        var latencies = {};
        Object.keys(this._latencies).forEach(function (endpointName) {
            var operationLatencies = _this._latencies[endpointName];
            var averageLatency = _this._averageLatency(operationLatencies);
            if (averageLatency > 0) {
                latencies["l_".concat(endpointName)] = averageLatency;
            }
        });
        return latencies;
    };
    default_1.prototype.startLatencyMeasure = function (operationType, identifier) {
        if (operationType === operations_1.default.PNSubscribeOperation || !identifier) {
            return;
        }
        this._trackedLatencies[identifier] = Date.now();
    };
    default_1.prototype.stopLatencyMeasure = function (operationType, identifier) {
        if (operationType === operations_1.default.PNSubscribeOperation || !identifier) {
            return;
        }
        var endpointName = this._endpointName(operationType);
        /** @type Array<Number> */
        var endpointLatencies = this._latencies[endpointName];
        var startDate = this._trackedLatencies[identifier];
        if (!endpointLatencies) {
            this._latencies[endpointName] = [];
            endpointLatencies = this._latencies[endpointName];
        }
        endpointLatencies.push(Date.now() - startDate);
        // Truncate samples count if there is more then configured.
        if (endpointLatencies.length > this._maximumSamplesCount) {
            endpointLatencies.splice(0, endpointLatencies.length - this._maximumSamplesCount);
        }
        delete this._trackedLatencies[identifier];
    };
    default_1.prototype._averageLatency = function (latencies) {
        var arrayReduce = function (accumulatedLatency, latency) { return accumulatedLatency + latency; };
        return Math.floor(latencies.reduce(arrayReduce, 0) / latencies.length);
    };
    default_1.prototype._endpointName = function (operationType) {
        var operation = null;
        switch (operationType) {
            case operations_1.default.PNPublishOperation:
                operation = 'pub';
                break;
            case operations_1.default.PNSignalOperation:
                operation = 'sig';
                break;
            case operations_1.default.PNHistoryOperation:
            case operations_1.default.PNFetchMessagesOperation:
            case operations_1.default.PNDeleteMessagesOperation:
            case operations_1.default.PNMessageCounts:
                operation = 'hist';
                break;
            case operations_1.default.PNUnsubscribeOperation:
            case operations_1.default.PNWhereNowOperation:
            case operations_1.default.PNHereNowOperation:
            case operations_1.default.PNHeartbeatOperation:
            case operations_1.default.PNSetStateOperation:
            case operations_1.default.PNGetStateOperation:
                operation = 'pres';
                break;
            case operations_1.default.PNAddChannelsToGroupOperation:
            case operations_1.default.PNRemoveChannelsFromGroupOperation:
            case operations_1.default.PNChannelGroupsOperation:
            case operations_1.default.PNRemoveGroupOperation:
            case operations_1.default.PNChannelsForGroupOperation:
                operation = 'cg';
                break;
            case operations_1.default.PNPushNotificationEnabledChannelsOperation:
            case operations_1.default.PNRemoveAllPushNotificationsOperation:
                operation = 'push';
                break;
            case operations_1.default.PNCreateUserOperation:
            case operations_1.default.PNUpdateUserOperation:
            case operations_1.default.PNDeleteUserOperation:
            case operations_1.default.PNGetUserOperation:
            case operations_1.default.PNGetUsersOperation:
            case operations_1.default.PNCreateSpaceOperation:
            case operations_1.default.PNUpdateSpaceOperation:
            case operations_1.default.PNDeleteSpaceOperation:
            case operations_1.default.PNGetSpaceOperation:
            case operations_1.default.PNGetSpacesOperation:
            case operations_1.default.PNGetMembersOperation:
            case operations_1.default.PNUpdateMembersOperation:
            case operations_1.default.PNGetMembershipsOperation:
            case operations_1.default.PNUpdateMembershipsOperation:
                operation = 'obj';
                break;
            case operations_1.default.PNAddMessageActionOperation:
            case operations_1.default.PNRemoveMessageActionOperation:
            case operations_1.default.PNGetMessageActionsOperation:
                operation = 'msga';
                break;
            case operations_1.default.PNAccessManagerGrant:
            case operations_1.default.PNAccessManagerAudit:
                operation = 'pam';
                break;
            case operations_1.default.PNAccessManagerGrantToken:
            case operations_1.default.PNAccessManagerRevokeToken:
                operation = 'pamv3';
                break;
            default:
                operation = 'time';
                break;
        }
        return operation;
    };
    return default_1;
}());
exports.default = default_1;
