"use strict";
/**
 * Delete messages REST API module.
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
exports.DeleteMessageRequest = void 0;
const transport_request_1 = require("../../types/transport-request");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
const utils_1 = require("../../utils");
// endregion
/**
 * Delete messages from channel history.
 *
 * @internal
 */
class DeleteMessageRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.DELETE });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNDeleteMessagesOperation;
    }
    validate() {
        if (!this.parameters.keySet.subscribeKey)
            return 'Missing Subscribe Key';
        if (!this.parameters.channel)
            return 'Missing channel';
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
        const { keySet: { subscribeKey }, channel, } = this.parameters;
        return `/v3/history/sub-key/${subscribeKey}/channel/${(0, utils_1.encodeString)(channel)}`;
    }
    get queryParameters() {
        const { start, end } = this.parameters;
        return Object.assign(Object.assign({}, (start ? { start } : {})), (end ? { end } : {}));
    }
}
exports.DeleteMessageRequest = DeleteMessageRequest;
