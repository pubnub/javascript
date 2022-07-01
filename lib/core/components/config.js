"use strict";
/*       */
/* global location */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var uuid_1 = __importDefault(require("./uuid"));
var PRESENCE_TIMEOUT_MINIMUM = 20;
var PRESENCE_TIMEOUT_DEFAULT = 300;
var makeDefaultOrigins = function () { return Array.from({ length: 20 }, function (_, i) { return "ps".concat(i + 1, ".pndsn.com"); }); };
var default_1 = /** @class */ (function () {
    function default_1(_a) {
        var setup = _a.setup;
        var _b, _c, _d;
        this._PNSDKSuffix = {};
        this.instanceId = "pn-".concat(uuid_1.default.createUUID());
        this.secretKey = setup.secretKey || setup.secret_key;
        this.subscribeKey = setup.subscribeKey || setup.subscribe_key;
        this.publishKey = setup.publishKey || setup.publish_key;
        this.sdkName = setup.sdkName;
        this.sdkFamily = setup.sdkFamily;
        this.partnerId = setup.partnerId;
        this.setAuthKey(setup.authKey);
        this.setCipherKey(setup.cipherKey);
        this.setFilterExpression(setup.filterExpression);
        if (typeof setup.origin !== 'string' && !Array.isArray(setup.origin) && setup.origin !== undefined) {
            throw new Error('Origin must be either undefined, a string or a list of strings.');
        }
        this.origin = setup.origin || makeDefaultOrigins();
        this.secure = setup.ssl || false;
        this.restore = setup.restore || false;
        this.proxy = setup.proxy;
        this.keepAlive = setup.keepAlive;
        this.keepAliveSettings = setup.keepAliveSettings;
        this.autoNetworkDetection = setup.autoNetworkDetection || false;
        this.dedupeOnSubscribe = setup.dedupeOnSubscribe || false;
        this.maximumCacheSize = setup.maximumCacheSize || 100;
        this.customEncrypt = setup.customEncrypt;
        this.customDecrypt = setup.customDecrypt;
        this.fileUploadPublishRetryLimit = (_b = setup.fileUploadPublishRetryLimit) !== null && _b !== void 0 ? _b : 5;
        this.useRandomIVs = (_c = setup.useRandomIVs) !== null && _c !== void 0 ? _c : true;
        // flag for beta subscribe feature enablement
        this.enableSubscribeBeta = (_d = setup.enableSubscribeBeta) !== null && _d !== void 0 ? _d : false;
        // if location config exist and we are in https, force secure to true.
        if (typeof location !== 'undefined' && location.protocol === 'https:') {
            this.secure = true;
        }
        this.logVerbosity = setup.logVerbosity || false;
        this.suppressLeaveEvents = setup.suppressLeaveEvents || false;
        this.announceFailedHeartbeats = setup.announceFailedHeartbeats || true;
        this.announceSuccessfulHeartbeats = setup.announceSuccessfulHeartbeats || false;
        this.useInstanceId = setup.useInstanceId || false;
        this.useRequestId = setup.useRequestId || false;
        this.requestMessageCountThreshold = setup.requestMessageCountThreshold;
        // set timeout to how long a transaction request will wait for the server (default 15 seconds)
        this.setTransactionTimeout(setup.transactionalRequestTimeout || 15 * 1000);
        // set timeout to how long a subscribe event loop will run (default 310 seconds)
        this.setSubscribeTimeout(setup.subscribeRequestTimeout || 310 * 1000);
        // set config on beacon (https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) usage
        this.setSendBeaconConfig(setup.useSendBeacon || true);
        // how long the SDK will report the client to be alive before issuing a timeout
        if (setup.presenceTimeout) {
            this.setPresenceTimeout(setup.presenceTimeout);
        }
        else {
            this._presenceTimeout = PRESENCE_TIMEOUT_DEFAULT;
        }
        if (setup.heartbeatInterval != null) {
            this.setHeartbeatInterval(setup.heartbeatInterval);
        }
        if (typeof setup.userId === 'string') {
            if (typeof setup.uuid === 'string') {
                throw new Error('Only one of the following configuration options has to be provided: `uuid` or `userId`');
            }
            this.setUserId(setup.userId);
        }
        else {
            if (typeof setup.uuid !== 'string') {
                throw new Error('One of the following configuration options has to be provided: `uuid` or `userId`');
            }
            this.setUUID(setup.uuid);
        }
    }
    // exposed setters
    default_1.prototype.getAuthKey = function () {
        return this.authKey;
    };
    default_1.prototype.setAuthKey = function (val) {
        this.authKey = val;
        return this;
    };
    default_1.prototype.setCipherKey = function (val) {
        this.cipherKey = val;
        return this;
    };
    default_1.prototype.getUUID = function () {
        return this.UUID;
    };
    default_1.prototype.setUUID = function (val) {
        if (!val || typeof val !== 'string' || val.trim().length === 0) {
            throw new Error('Missing uuid parameter. Provide a valid string uuid');
        }
        this.UUID = val;
        return this;
    };
    default_1.prototype.getUserId = function () {
        return this.UUID;
    };
    default_1.prototype.setUserId = function (value) {
        if (!value || typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
        }
        this.UUID = value;
        return this;
    };
    default_1.prototype.getFilterExpression = function () {
        return this.filterExpression;
    };
    default_1.prototype.setFilterExpression = function (val) {
        this.filterExpression = val;
        return this;
    };
    default_1.prototype.getPresenceTimeout = function () {
        return this._presenceTimeout;
    };
    default_1.prototype.setPresenceTimeout = function (val) {
        if (val >= PRESENCE_TIMEOUT_MINIMUM) {
            this._presenceTimeout = val;
        }
        else {
            this._presenceTimeout = PRESENCE_TIMEOUT_MINIMUM;
            // eslint-disable-next-line no-console
            console.log('WARNING: Presence timeout is less than the minimum. Using minimum value: ', this._presenceTimeout);
        }
        this.setHeartbeatInterval(this._presenceTimeout / 2 - 1);
        return this;
    };
    default_1.prototype.setProxy = function (proxy) {
        this.proxy = proxy;
    };
    default_1.prototype.getHeartbeatInterval = function () {
        return this._heartbeatInterval;
    };
    default_1.prototype.setHeartbeatInterval = function (val) {
        this._heartbeatInterval = val;
        return this;
    };
    // deprecated setters.
    default_1.prototype.getSubscribeTimeout = function () {
        return this._subscribeRequestTimeout;
    };
    default_1.prototype.setSubscribeTimeout = function (val) {
        this._subscribeRequestTimeout = val;
        return this;
    };
    default_1.prototype.getTransactionTimeout = function () {
        return this._transactionalRequestTimeout;
    };
    default_1.prototype.setTransactionTimeout = function (val) {
        this._transactionalRequestTimeout = val;
        return this;
    };
    default_1.prototype.isSendBeaconEnabled = function () {
        return this._useSendBeacon;
    };
    default_1.prototype.setSendBeaconConfig = function (val) {
        this._useSendBeacon = val;
        return this;
    };
    default_1.prototype.getVersion = function () {
        return '7.2.0';
    };
    default_1.prototype._addPnsdkSuffix = function (name, suffix) {
        this._PNSDKSuffix[name] = suffix;
    };
    default_1.prototype._getPnsdkSuffix = function (separator) {
        var _this = this;
        return Object.keys(this._PNSDKSuffix).reduce(function (result, key) { return result + separator + _this._PNSDKSuffix[key]; }, '');
    };
    return default_1;
}());
exports.default = default_1;
