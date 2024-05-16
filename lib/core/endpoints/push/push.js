"use strict";
/**
 * Manage channels enabled for device push REST API module.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePushNotificationChannelsRequest = void 0;
const request_1 = require("../../components/request");
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Environment for which APNS2 notifications
 */
const ENVIRONMENT = 'development';
/**
 * Maximum number of channels in `list` response.
 */
const MAX_COUNT = 1000;
// endregion
/**
 * Base push notification request.
 *
 * @internal
 */
class BasePushNotificationChannelsRequest extends request_1.AbstractRequest {
    constructor(parameters) {
        var _a;
        var _b;
        super();
        this.parameters = parameters;
        // Apply request defaults
        if (this.parameters.pushGateway === 'apns2')
            (_a = (_b = this.parameters).environment) !== null && _a !== void 0 ? _a : (_b.environment = ENVIRONMENT);
        if (this.parameters.count && this.parameters.count > MAX_COUNT)
            this.parameters.count = MAX_COUNT;
    }
    operation() {
        throw Error('Should be implemented in subclass.');
    }
    validate() {
        const { keySet: { subscribeKey }, action, device, pushGateway, } = this.parameters;
        if (!subscribeKey)
            return 'Missing Subscribe Key';
        if (!device)
            return 'Missing Device ID (device)';
        if ((action === 'add' || action === 'remove') &&
            (!('channels' in this.parameters) || this.parameters.channels.length === 0))
            return 'Missing Channels';
        if (!pushGateway)
            return 'Missing GW Type (pushGateway: gcm or apns2)';
        if (this.parameters.pushGateway === 'apns2' && !this.parameters.topic)
            return 'Missing APNS2 topic';
    }
    parse(_response) {
        return __awaiter(this, void 0, void 0, function* () {
            throw Error('Should be implemented in subclass.');
        });
    }
    get path() {
        const { keySet: { subscribeKey }, action, device, pushGateway, } = this.parameters;
        let path = pushGateway === 'apns2'
            ? `/v2/push/sub-key/${subscribeKey}/devices-apns2/${device}`
            : `/v1/push/sub-key/${subscribeKey}/devices/${device}`;
        if (action === 'remove-device')
            path = `${path}/remove`;
        return path;
    }
    get queryParameters() {
        const { start, count } = this.parameters;
        let query = Object.assign(Object.assign({ type: this.parameters.pushGateway }, (start ? { start } : {})), (count && count > 0 ? { count } : {}));
        if ('channels' in this.parameters)
            query[this.parameters.action] = this.parameters.channels.join(',');
        if (this.parameters.pushGateway === 'apns2') {
            const { environment, topic } = this.parameters;
            query = Object.assign(Object.assign({}, query), { environment: environment, topic });
        }
        return query;
    }
}
exports.BasePushNotificationChannelsRequest = BasePushNotificationChannelsRequest;
