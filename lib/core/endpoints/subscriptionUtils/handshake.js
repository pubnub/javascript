"use strict";
/**
 * Handshake subscribe REST API module.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeSubscribeRequest = void 0;
const operations_1 = __importDefault(require("../../constants/operations"));
const subscribe_1 = require("../subscribe");
const utils_1 = require("../../utils");
/**
 * Handshake subscribe request.
 *
 * Separate subscribe request required by Event Engine.
 *
 * @internal
 */
class HandshakeSubscribeRequest extends subscribe_1.BaseSubscribeRequest {
    operation() {
        return operations_1.default.PNHandshakeOperation;
    }
    get path() {
        const { keySet: { subscribeKey }, channels = [], } = this.parameters;
        return `/v2/subscribe/${subscribeKey}/${(0, utils_1.encodeNames)(channels.sort(), ',')}/0`;
    }
    get queryParameters() {
        const { channelGroups, filterExpression, state } = this.parameters;
        const query = { tt: 0, ee: '' };
        if (channelGroups && channelGroups.length > 0)
            query['channel-group'] = channelGroups.sort().join(',');
        if (filterExpression && filterExpression.length > 0)
            query['filter-expr'] = filterExpression;
        if (state && Object.keys(state).length > 0)
            query['state'] = JSON.stringify(state);
        return query;
    }
}
exports.HandshakeSubscribeRequest = HandshakeSubscribeRequest;
