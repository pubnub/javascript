"use strict";
/**
 * Channels / channel groups presence REST API module.
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
exports.HereNowRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../errors/pubnub-api-error");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether `uuid` should be included in response or not.
 */
const INCLUDE_UUID = true;
/**
 * Whether state associated with `uuid` should be included in response or not.
 */
const INCLUDE_STATE = false;
// endregion
/**
 * Channel presence request.
 *
 * @internal
 */
class HereNowRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a, _b, _c;
        var _d, _e, _f;
        super();
        this.parameters = parameters;
        // Apply defaults.
        (_a = (_d = this.parameters).queryParameters) !== null && _a !== void 0 ? _a : (_d.queryParameters = {});
        (_b = (_e = this.parameters).includeUUIDs) !== null && _b !== void 0 ? _b : (_e.includeUUIDs = INCLUDE_UUID);
        (_c = (_f = this.parameters).includeState) !== null && _c !== void 0 ? _c : (_f.includeState = INCLUDE_STATE);
    }
    operation() {
        const { channels = [], channelGroups = [] } = this.parameters;
        return channels.length === 0 && channelGroups.length === 0
            ? operations_1.default.PNGlobalHereNowOperation
            : operations_1.default.PNHereNowOperation;
    }
    validate() {
        if (!this.parameters.keySet.subscribeKey)
            return 'Missing Subscribe Key';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            // Extract general presence information.
            const totalChannels = 'occupancy' in serviceResponse ? 1 : serviceResponse.payload.total_channels;
            const totalOccupancy = 'occupancy' in serviceResponse ? serviceResponse.occupancy : serviceResponse.payload.total_channels;
            const channelsPresence = {};
            let channels = {};
            // Remap single channel presence to multiple channels presence response.
            if ('occupancy' in serviceResponse) {
                const channel = this.parameters.channels[0];
                channels[channel] = { uuids: (_a = serviceResponse.uuids) !== null && _a !== void 0 ? _a : [], occupancy: totalOccupancy };
            }
            else
                channels = (_b = serviceResponse.payload.channels) !== null && _b !== void 0 ? _b : {};
            Object.keys(channels).forEach((channel) => {
                const channelEntry = channels[channel];
                channelsPresence[channel] = {
                    occupants: this.parameters.includeUUIDs
                        ? channelEntry.uuids.map((uuid) => {
                            if (typeof uuid === 'string')
                                return { uuid, state: null };
                            return uuid;
                        })
                        : [],
                    name: channel,
                    occupancy: channelEntry.occupancy,
                };
            });
            return {
                totalChannels,
                totalOccupancy,
                channels: channelsPresence,
            };
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channels, channelGroups, } = this.parameters;
        let path = `/v2/presence/sub-key/${subscribeKey}`;
        if ((channels && channels.length > 0) || (channelGroups && channelGroups.length > 0))
            path += `/channel/${(0, utils_1.encodeNames)(channels !== null && channels !== void 0 ? channels : [], ',')}`;
        return path;
    }
    get queryParameters() {
        const { channelGroups, includeUUIDs, includeState, queryParameters } = this.parameters;
        return Object.assign(Object.assign(Object.assign(Object.assign({}, (!includeUUIDs ? { disable_uuids: '1' } : {})), ((includeState !== null && includeState !== void 0 ? includeState : false) ? { state: '1' } : {})), (channelGroups && channelGroups.length > 0 ? { 'channel-group': channelGroups.join(',') } : {})), queryParameters);
    }
}
exports.HereNowRequest = HereNowRequest;
