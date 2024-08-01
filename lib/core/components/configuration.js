"use strict";
/**
 * {@link PubNub} client configuration module.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeConfiguration = void 0;
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
 * @param setupCryptoModule - Platform-provided {@link CryptoModule} configuration block.
 *
 * @returns `PubNub` client private configuration.
 *
 * @internal
 */
const makeConfiguration = (base, setupCryptoModule) => {
    var _a, _b, _c;
    // Ensure that retry policy has proper configuration (if has been set).
    (_a = base.retryConfiguration) === null || _a === void 0 ? void 0 : _a.validate();
    (_b = base.useRandomIVs) !== null && _b !== void 0 ? _b : (base.useRandomIVs = USE_RANDOM_INITIALIZATION_VECTOR);
    // Override origin value.
    base.origin = standardOrigin((_c = base.ssl) !== null && _c !== void 0 ? _c : false, base.origin);
    const cryptoModule = base.cryptoModule;
    if (cryptoModule)
        delete base.cryptoModule;
    const clientConfiguration = Object.assign(Object.assign({}, base), { _pnsdkSuffix: {}, _instanceId: `pn-${uuid_1.default.createUUID()}`, _cryptoModule: undefined, _cipherKey: undefined, _setupCryptoModule: setupCryptoModule, get instanceId() {
            if (this.useInstanceId)
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
            });
        },
        getCryptoModule() {
            return this._cryptoModule;
        },
        getUseRandomIVs() {
            return base.useRandomIVs;
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
        get PubNubFile() {
            return base.PubNubFile;
        },
        get version() {
            return '8.2.7';
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
    if (base.cipherKey)
        clientConfiguration.setCipherKey(base.cipherKey);
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
