"use strict";
/**
 * Set Channel REST API module.
 *
 * Full resource replacement via PUT.
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
exports.SetChannelRequest = void 0;
const transport_request_1 = require("../../../types/transport-request");
const request_1 = require("../../../components/request");
const operations_1 = __importDefault(require("../../../constants/operations"));
const utils_1 = require("../../../utils");
// endregion
/**
 * Set Channel request.
 *
 * @internal
 */
class SetChannelRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        super({ method: transport_request_1.TransportMethod.PUT });
        this.parameters = parameters;
    }
    operation() {
        return operations_1.default.PNSetDataSyncChannelOperation;
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            // The DataSync service returns the object envelope ({ data } or { data, meta }) without a
            // top-level HTTP status; surface `response.status` so callers can inspect it (parity with remove).
            const parsed = this.deserializeResponse(response);
            return Object.assign(Object.assign({}, parsed), { status: response.status });
        });
    }
    validate() {
        if (!this.parameters.id)
            return 'Channel id cannot be empty';
        if (!this.parameters.data)
            return 'Channel data cannot be empty';
        if (this.parameters.data.classVersion === undefined || this.parameters.data.classVersion === null)
            return 'Entity class version cannot be empty';
    }
    get headers() {
        var _a;
        let headers = (_a = super.headers) !== null && _a !== void 0 ? _a : {};
        if (this.parameters.ifMatchesEtag)
            headers = Object.assign(Object.assign({}, headers), { 'If-Match': this.parameters.ifMatchesEtag });
        return Object.assign(Object.assign({}, headers), { 'Content-Type': 'application/vnd.pubnub.objects.channel+json;version=1' });
    }
    get path() {
        const { keySet: { subscribeKey }, id, } = this.parameters;
        return `/v1/datasync/subkeys/${subscribeKey}/channels/${(0, utils_1.encodeString)(id)}`;
    }
    get body() {
        const { data } = this.parameters;
        return JSON.stringify({
            data: Object.assign(Object.assign({ entityClassVersion: data.classVersion }, (data.status !== undefined ? { status: data.status } : {})), (data.payload !== undefined ? { payload: data.payload } : {})),
        });
    }
}
exports.SetChannelRequest = SetChannelRequest;
