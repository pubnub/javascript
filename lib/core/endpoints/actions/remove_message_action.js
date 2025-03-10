"use strict";
/**
 * Remove Message Action REST API module.
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
exports.RemoveMessageAction = void 0;
const transport_request_1 = require("../../types/transport-request");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Remove specific message action request.
 *
 * @internal
 */
class RemoveMessageAction extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.DELETE });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNRemoveMessageActionOperation;
    }
    validate() {
        const { keySet: { subscribeKey }, channel, messageTimetoken, actionTimetoken, } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!channel)
            return 'Missing message action channel';
        if (!messageTimetoken)
            return 'Missing message timetoken';
        if (!actionTimetoken)
            return 'Missing action timetoken';
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
        const { keySet: { subscribeKey }, channel, actionTimetoken, messageTimetoken, } = this.parameters;
        return `/v1/message-actions/${subscribeKey}/channel/${(0, utils_1.encodeString)(channel)}/message/${messageTimetoken}/action/${actionTimetoken}`;
    }
}
exports.RemoveMessageAction = RemoveMessageAction;
