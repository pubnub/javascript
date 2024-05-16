"use strict";
/**
 * Messages count REST API module.
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
exports.MessageCountRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../errors/pubnub-api-error");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Count messages request.
 *
 * @internal
 */
class MessageCountRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNMessageCounts;
    }
    validate() {
        const { keySet: { subscribeKey }, channels, timetoken, channelTimetokens, } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!channels)
            return 'Missing channels';
        if (timetoken && channelTimetokens)
            return '`timetoken` and `channelTimetokens` are incompatible together';
        if (!timetoken && !channelTimetokens)
            return '`timetoken` or `channelTimetokens` need to be set';
        if (channelTimetokens && channelTimetokens.length > 1 && channelTimetokens.length !== channels.length)
            return 'Length of `channelTimetokens` and `channels` do not match';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            return { channels: serviceResponse.channels };
        });
    }
    get path() {
        return `/v3/history/sub-key/${this.parameters.keySet.subscribeKey}/message-counts/${(0, utils_1.encodeNames)(this.parameters.channels)}`;
    }
    get queryParameters() {
        let { channelTimetokens } = this.parameters;
        if (this.parameters.timetoken)
            channelTimetokens = [this.parameters.timetoken];
        return Object.assign(Object.assign({}, (channelTimetokens.length === 1 ? { timetoken: channelTimetokens[0] } : {})), (channelTimetokens.length > 1 ? { channelsTimetoken: channelTimetokens.join(',') } : {}));
    }
}
exports.MessageCountRequest = MessageCountRequest;
