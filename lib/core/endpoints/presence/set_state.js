"use strict";
/**
 * Set Presence State REST API module.
 *
 * @internal
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
exports.SetPresenceStateRequest = void 0;
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Set `uuid` presence state request.
 *
 * @internal
 */
class SetPresenceStateRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNSetStateOperation;
    }
    validate() {
        const { keySet: { subscribeKey }, state, channels = [], channelGroups = [], } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (state === undefined)
            return 'Missing State';
        if ((channels === null || channels === void 0 ? void 0 : channels.length) === 0 && (channelGroups === null || channelGroups === void 0 ? void 0 : channelGroups.length) === 0)
            return 'Please provide a list of channels and/or channel-groups';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return { state: this.deserializeResponse(response).payload };
        });
    }
    get path() {
        const { keySet: { subscribeKey }, uuid, channels, } = this.parameters;
        return `/v2/presence/sub-key/${subscribeKey}/channel/${(0, utils_1.encodeNames)(channels !== null && channels !== void 0 ? channels : [], ',')}/uuid/${(0, utils_1.encodeString)(uuid)}/data`;
    }
    get queryParameters() {
        const { channelGroups, state } = this.parameters;
        const query = { state: JSON.stringify(state) };
        if (channelGroups && channelGroups.length !== 0)
            query['channel-group'] = channelGroups.join(',');
        return query;
    }
}
exports.SetPresenceStateRequest = SetPresenceStateRequest;
