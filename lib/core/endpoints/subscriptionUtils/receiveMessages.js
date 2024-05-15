"use strict";
/**
 * Receive messages subscribe REST API module.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiveMessagesSubscribeRequest = void 0;
const operations_1 = __importDefault(require("../../constants/operations"));
const subscribe_1 = require("../subscribe");
const utils_1 = require("../../utils");
/**
 * Receive messages subscribe request.
 *
 * @internal
 */
class ReceiveMessagesSubscribeRequest extends subscribe_1.BaseSubscribeRequest {
    operation() {
        return operations_1.default.PNReceiveMessagesOperation;
    }
    validate() {
        const validationResult = super.validate();
        if (validationResult)
            return validationResult;
        if (!this.parameters.timetoken)
            return 'timetoken can not be empty';
        if (!this.parameters.region)
            return 'region can not be empty';
    }
    get path() {
        const { keySet: { subscribeKey }, channels = [], } = this.parameters;
        return `/v2/subscribe/${subscribeKey}/${(0, utils_1.encodeNames)(channels.sort(), ',')}/0`;
    }
    get queryParameters() {
        const { channelGroups, filterExpression, timetoken, region } = this.parameters;
        const query = { ee: '' };
        if (channelGroups && channelGroups.length > 0)
            query['channel-group'] = channelGroups.sort().join(',');
        if (filterExpression && filterExpression.length > 0)
            query['filter-expr'] = filterExpression;
        if (typeof timetoken === 'string') {
            if (timetoken && timetoken.length > 0)
                query['tt'] = timetoken;
        }
        else if (timetoken && timetoken > 0)
            query['tt'] = timetoken;
        if (region)
            query['tr'] = region;
        return query;
    }
}
exports.ReceiveMessagesSubscribeRequest = ReceiveMessagesSubscribeRequest;
