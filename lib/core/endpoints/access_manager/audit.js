"use strict";
/**
 * PAM Audit REST API module.
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
exports.AuditRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const pubnub_api_error_1 = require("../../../errors/pubnub-api-error");
const request_1 = require("../../components/request");
const operations_1 = __importDefault(require("../../constants/operations"));
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Auth keys for which permissions should be audited.
 */
const AUTH_KEYS = [];
// endregion
/**
 * Permissions audit request.
 *
 * @internal
 */
class AuditRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a;
        var _b;
        super();
        this.parameters = parameters;
        // Apply default request parameters.
        (_a = (_b = this.parameters).authKeys) !== null && _a !== void 0 ? _a : (_b.authKeys = AUTH_KEYS);
    }
    operation() {
        return operations_1.default.PNAccessManagerAudit;
    }
    validate() {
        if (!this.parameters.keySet.subscribeKey)
            return 'Missing Subscribe Key';
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse) {
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            }
            else if (serviceResponse.status >= 400)
                throw pubnub_api_error_1.PubNubAPIError.create(response);
            return serviceResponse.payload;
        });
    }
    get path() {
        return `/v2/auth/audit/sub-key/${this.parameters.keySet.subscribeKey}`;
    }
    get queryParameters() {
        const { channel, channelGroup, authKeys } = this.parameters;
        return Object.assign(Object.assign(Object.assign({}, (channel ? { channel } : {})), (channelGroup ? { 'channel-group': channelGroup } : {})), (authKeys && authKeys.length ? { auth: authKeys.join(',') } : {}));
    }
}
exports.AuditRequest = AuditRequest;
