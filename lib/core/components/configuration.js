"use strict";
/**
 * {@link PubNub} client configuration module.
 *
 * @internal
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeConfiguration = void 0;
const console_logger_1 = require("../../loggers/console-logger");
const retry_policy_1 = require("./retry-policy");
const logger_1 = require("../interfaces/logger");
const logger_manager_1 = require("./logger-manager");
const uuid_1 = __importDefault(require("./uuid"));
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether encryption (if set) should use random initialization vector or not.
 *
 * @internal
 */
const USE_RANDOM_INITIALIZATION_VECTOR = true;
/**
 * Create {@link PubNub} client private configuration object.
 *
 * @param base - User- and platform-provided configuration.
 * @param setupCryptoModule - Platform-provided {@link ICryptoModule} configuration block.
 *
 * @returns `PubNub` client private configuration.
 *
 * @internal
 */
const makeConfiguration = (base, setupCryptoModule) => {
    var _a, _b, _c, _d;
    // Set the default retry policy for subscribing (if new subscribe logic not used).
    if (!base.retryConfiguration && base.enableEventEngine) {
        base.retryConfiguration = retry_policy_1.RetryPolicy.ExponentialRetryPolicy({
            minimumDelay: 2,
            maximumDelay: 150,
            maximumRetry: 6,
            excluded: [
                retry_policy_1.Endpoint.MessageSend,
                retry_policy_1.Endpoint.Presence,
                retry_policy_1.Endpoint.Files,
                retry_policy_1.Endpoint.MessageStorage,
                retry_policy_1.Endpoint.ChannelGroups,
                retry_policy_1.Endpoint.DevicePushNotifications,
                retry_policy_1.Endpoint.AppContext,
                retry_policy_1.Endpoint.MessageReactions,
            ],
        });
    }
    const instanceId = `pn-${uuid_1.default.createUUID()}`;
    if (base.logVerbosity)
        base.logLevel = logger_1.LogLevel.Debug;
    else if (base.logLevel === undefined)
        base.logLevel = logger_1.LogLevel.None;
    // Prepare loggers manager.
    const loggerManager = new logger_manager_1.LoggerManager(hashFromString(instanceId), base.logLevel, [
        ...((_a = base.loggers) !== null && _a !== void 0 ? _a : []),
        new console_logger_1.ConsoleLogger(),
    ]);
    if (base.logVerbosity !== undefined)
        loggerManager.warn('Configuration', "'logVerbosity' is deprecated. Use 'logLevel' instead.");
    // Ensure that retry policy has proper configuration (if has been set).
    (_b = base.retryConfiguration) === null || _b === void 0 ? void 0 : _b.validate();
    (_c = base.useRandomIVs) !== null && _c !== void 0 ? _c : (base.useRandomIVs = USE_RANDOM_INITIALIZATION_VECTOR);
    if (base.useRandomIVs)
        loggerManager.warn('Configuration', "'useRandomIVs' is deprecated. Use 'cryptoModule' instead.");
    // Override origin value.
    base.origin = standardOrigin((_d = base.ssl) !== null && _d !== void 0 ? _d : false, base.origin);
    const cryptoModule = base.cryptoModule;
    if (cryptoModule)
        delete base.cryptoModule;
    const clientConfiguration = Object.assign(Object.assign({}, base), { _pnsdkSuffix: {}, _loggerManager: loggerManager, _instanceId: instanceId, _cryptoModule: undefined, _cipherKey: undefined, _setupCryptoModule: setupCryptoModule, get instanceId() {
            if (base.useInstanceId)
                return this._instanceId;
            return undefined;
        },
        getInstanceId() {
            if (base.useInstanceId)
                return this._instanceId;
            return undefined;
        },
        getUserId() {
            return this.userId;
        },
        setUserId(value) {
            if (!value || typeof value !== 'string' || value.trim().length === 0)
                throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
            this.userId = value;
        },
        logger() {
            return this._loggerManager;
        },
        getAuthKey() {
            return this.authKey;
        },
        setAuthKey(authKey) {
            this.authKey = authKey;
        },
        getFilterExpression() {
            return this.filterExpression;
        },
        setFilterExpression(expression) {
            this.filterExpression = expression;
        },
        getCipherKey() {
            return this._cipherKey;
        },
        setCipherKey(key) {
            this._cipherKey = key;
            if (!key && this._cryptoModule) {
                this._cryptoModule = undefined;
                return;
            }
            else if (!key || !this._setupCryptoModule)
                return;
            this._cryptoModule = this._setupCryptoModule({
                cipherKey: key,
                useRandomIVs: base.useRandomIVs,
                customEncrypt: this.getCustomEncrypt(),
                customDecrypt: this.getCustomDecrypt(),
                logger: this.logger(),
            });
        },
        getCryptoModule() {
            return this._cryptoModule;
        },
        getUseRandomIVs() {
            return base.useRandomIVs;
        },
        getKeepPresenceChannelsInPresenceRequests() {
            // @ts-expect-error: Access field from web-based SDK configuration.
            return base.sdkFamily === 'Web' && base['subscriptionWorkerUrl'];
        },
        setPresenceTimeout(value) {
            this.heartbeatInterval = value / 2 - 1;
            this.presenceTimeout = value;
        },
        getPresenceTimeout() {
            return this.presenceTimeout;
        },
        getHeartbeatInterval() {
            return this.heartbeatInterval;
        },
        setHeartbeatInterval(interval) {
            this.heartbeatInterval = interval;
        },
        getTransactionTimeout() {
            return this.transactionalRequestTimeout;
        },
        getSubscribeTimeout() {
            return this.subscribeRequestTimeout;
        },
        getFileTimeout() {
            return this.fileRequestTimeout;
        },
        get PubNubFile() {
            return base.PubNubFile;
        },
        get version() {
            return '9.8.0';
        },
        getVersion() {
            return this.version;
        },
        _addPnsdkSuffix(name, suffix) {
            this._pnsdkSuffix[name] = `${suffix}`;
        },
        _getPnsdkSuffix(separator) {
            const sdk = Object.values(this._pnsdkSuffix).join(separator);
            return sdk.length > 0 ? separator + sdk : '';
        },
        // --------------------------------------------------------
        // ---------------------- Deprecated ----------------------
        // --------------------------------------------------------
        // region Deprecated
        getUUID() {
            return this.getUserId();
        },
        setUUID(value) {
            this.setUserId(value);
        },
        getCustomEncrypt() {
            return base.customEncrypt;
        },
        getCustomDecrypt() {
            return base.customDecrypt;
        } });
    // Setup `CryptoModule` if possible.
    if (base.cipherKey) {
        loggerManager.warn('Configuration', "'cipherKey' is deprecated. Use 'cryptoModule' instead.");
        clientConfiguration.setCipherKey(base.cipherKey);
    }
    else if (cryptoModule)
        clientConfiguration._cryptoModule = cryptoModule;
    return clientConfiguration;
};
exports.makeConfiguration = makeConfiguration;
/**
 * Decide {@lin PubNub} service REST API origin.
 *
 * @param secure - Whether preferred to use secured connection or not.
 * @param origin - User-provided or default origin.
 *
 * @returns `PubNub` REST API endpoints origin.
 */
const standardOrigin = (secure, origin) => {
    const protocol = secure ? 'https://' : 'http://';
    if (typeof origin === 'string')
        return `${protocol}${origin}`;
    return `${protocol}${origin[Math.floor(Math.random() * origin.length)]}`;
};
/**
 * Compute 32bit hash string from source value.
 *
 * @param value - String from which hash string should be computed.
 *
 * @returns Computed hash.
 */
const hashFromString = (value) => {
    let basis = 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
        basis ^= value.charCodeAt(i);
        basis = (basis + ((basis << 1) + (basis << 4) + (basis << 7) + (basis << 8) + (basis << 24))) >>> 0;
    }
    return basis.toString(16).padStart(8, '0');
};
