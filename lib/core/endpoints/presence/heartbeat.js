"use strict";
/**
 * Announce heartbeat REST API module.
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
exports.HeartbeatRequest = void 0;
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Announce `uuid` presence request.
 *
 * @internal
 */
class HeartbeatRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ cancellable: true });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNHeartbeatOperation;
    }
    validate() {
        const { keySet: { subscribeKey }, channels = [], channelGroups = [], } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (channels.length === 0 && channelGroups.length === 0)
            return 'Please provide a list of channels and/or channel-groups';
    }
    parse(response) {
        const _super = Object.create(null, {
            parse: { get: () => super.parse }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.parse.call(this, response).then((_) => ({}));
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channels, } = this.parameters;
        return `/v2/presence/sub-key/${subscribeKey}/channel/${(0, utils_1.encodeNames)(channels !== null && channels !== void 0 ? channels : [], ',')}/heartbeat`;
    }
    get queryParameters() {
        const { channelGroups, state, heartbeat } = this.parameters;
        const query = { heartbeat: `${heartbeat}` };
        if (channelGroups && channelGroups.length !== 0)
            query['channel-group'] = channelGroups.join(',');
        if (state !== undefined)
            query.state = JSON.stringify(state);
        return query;
    }
}
exports.HeartbeatRequest = HeartbeatRequest;
