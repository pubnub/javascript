/**
 * Unregister Channels from Device push REST API module.
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
import { createValidationError, PubnubError } from '../../../errors/pubnub-error';
import { BasePushNotificationChannelsRequest } from './push';
import RequestOperation from '../../constants/operations';
// endregion
/**
 * Unregister channels from device push request.
 */
// prettier-ignore
export class RemoveDevicePushNotificationChannelsRequest extends BasePushNotificationChannelsRequest {
    constructor(parameters) {
        super(Object.assign(Object.assign({}, parameters), { action: 'remove' }));
    }
    operation() {
        return RequestOperation.PNRemovePushNotificationEnabledChannelsOperation;
    }
    parse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceResponse = this.deserializeResponse(response);
            if (!serviceResponse)
                throw new PubnubError('Service response error, check status for details', createValidationError('Unable to deserialize service response'));
            return {};
        });
    }
}
