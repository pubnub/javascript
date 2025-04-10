"use strict";
/**
 * Add Message Action REST API module.
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
exports.AddMessageActionRequest = void 0;
const transport_request_1 = require("../../types/transport-request");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Add Message Reaction request.
 *
 * @internal
 */
class AddMessageActionRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.POST });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNAddMessageActionOperation;
    }
    validate() {
        const { keySet: { subscribeKey }, action, channel, messageTimetoken, } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!channel)
            return 'Missing message channel';
        if (!messageTimetoken)
            return 'Missing message timetoken';
        if (!action)
            return 'Missing Action';
        if (!action.value)
            return 'Missing Action.value';
        if (!action.type)
            return 'Missing Action.type';
        if (action.type.length > 15)
            return 'Action.type value exceed maximum length of 15';
    }
    parse(response) {
        const _super = Object.create(null, {
            parse: { get: () => super.parse }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.parse.call(this, response).then(({ data }) => ({ data }));
        });
    }
    get path() {
        const { keySet: { subscribeKey }, channel, messageTimetoken, } = this.parameters;
        return `/v1/message-actions/${subscribeKey}/channel/${(0, utils_1.encodeString)(channel)}/message/${messageTimetoken}`;
    }
    get headers() {
        var _a;
        return Object.assign(Object.assign({}, ((_a = super.headers) !== null && _a !== void 0 ? _a : {})), { 'Content-Type': 'application/json' });
    }
    get body() {
        return JSON.stringify(this.parameters.action);
    }
}
exports.AddMessageActionRequest = AddMessageActionRequest;
