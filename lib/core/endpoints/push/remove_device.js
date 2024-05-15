"use strict";
/**
 * Unregister Device push REST API module.
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
exports.RemoveDevicePushNotificationRequest = void 0;
const pubnub_error_1 = require("../../../errors/pubnub-error");
const push_1 = require("./push");
const operations_1 = __importDefault(require("../../constants/operations"));
// endregion
/**
 * Unregister device push notifications request.
 *
 * @internal
 */
// prettier-ignore
class RemoveDevicePushNotificationRequest extends push_1.BasePushNotificationChannelsRequest {
    constructor(parameters) {
        super(Object.assign(Object.assign({}, parameters), { action: 'remove-device' }));
    }
    operation() {
        return operations_1.default.PNRemoveAllPushNotificationsOperation;
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new pubnub_error_1.PubNubError('Service response error, check status for details', (0, pubnub_error_1.createValidationError)('Unable to deserialize service response'));
            return {};
        });
    }
}
exports.RemoveDevicePushNotificationRequest = RemoveDevicePushNotificationRequest;
