"use strict";
/**
 * Announce leave REST API module.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceLeaveRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../errors/pubnub-api-error");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Announce user leave request.
 *
 * @internal
 */
class PresenceLeaveRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
        if (this.parameters.channelGroups)
            this.parameters.channelGroups = Array.from(new Set(this.parameters.channelGroups));
        if (this.parameters.channels)
            this.parameters.channels = Array.from(new Set(this.parameters.channels));
    }
    operation() {
        return operations_1.default.PNUnsubscribeOperation;
    }
    validate() {
        const { keySet: { subscribeKey }, channels = [], channelGroups = [], } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (channels.length === 0 && channelGroups.length === 0)
            return 'At least one `channel` or `channel group` should be provided.';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            return {};
        });
    }
    get path() {
        var _a;
        const { keySet: { subscribeKey }, channels, } = this.parameters;
        return `/v2/presence/sub-key/${subscribeKey}/channel/${(0, utils_1.encodeNames)((_a = channels === null || channels === void 0 ? void 0 : channels.sort()) !== null && _a !== void 0 ? _a : [], ',')}/leave`;
    }
    get queryParameters() {
        const { channelGroups } = this.parameters;
        if (!channelGroups || channelGroups.length === 0)
            return {};
        return { 'channel-group': channelGroups.sort().join(',') };
    }
}
exports.PresenceLeaveRequest = PresenceLeaveRequest;
