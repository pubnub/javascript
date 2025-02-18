"use strict";
/**
 * List channel group channels REST API module.
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
exports.ListChannelGroupChannels = void 0;
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * List Channel Group Channels request.
 *
 * @internal
 */
class ListChannelGroupChannels extends request_1.AbstractRequest {
    constructor(parameters) {
        super();
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNChannelsForGroupOperation;
    }
    validate() {
        if (!this.parameters.keySet.subscribeKey)
            return 'Missing Subscribe Key';
        if (!this.parameters.channelGroup)
            return 'Missing Channel Group';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            return { channels: this.deserializeResponse(response).payload.channels };
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channelGroup, } = this.parameters;
        return `/v1/channel-registration/sub-key/${subscribeKey}/channel-group/${(0, utils_1.encodeString)(channelGroup)}`;
    }
}
exports.ListChannelGroupChannels = ListChannelGroupChannels;
