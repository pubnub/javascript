/**
 * {@link PubNub} client configuration module.
 */
import uuidGenerator from './uuid';
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether encryption (if set) should use random initialization vector or not.
 */
const USE_RANDOM_INITIALIZATION_VECTOR = true;
/**
 * Create {@link PubNub} client private configuration object.
 *
 * @param base - User- and platform-provided configuration.
 * @param setupCryptoModule - Platform-provided {@link CryptoModule} configuration block.
 *
 * @returns `PubNub` client private configuration.
 */
export const makeConfiguration = (base, setupCryptoModule) => {
    var _a, _b, _c;
    // Ensure that retry policy has proper configuration (if has been set).
    (_a = base.retryConfiguration) === null || _a === void 0 ? void 0 : _a.validate();
    (_b = base.useRandomIVs) !== null && _b !== void 0 ? _b : (base.useRandomIVs = USE_RANDOM_INITIALIZATION_VECTOR);
    // Override origin value.
    base.origin = standardOrigin((_c = base.ssl) !== null && _c !== void 0 ? _c : false, base.origin);
    const clientConfiguration = Object.assign(Object.assign({}, base), { _pnsdkSuffix: {}, _instanceId: `pn-${uuidGenerator.createUUID()}`, _cryptoModule: undefined, _cipherKey: undefined, _setupCryptoModule: setupCryptoModule, get instanceId() {
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
        get cipherKey() {
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
                customEncrypt: this.customEncrypt,
                customDecrypt: this.customDecrypt,
            });
        },
        get cryptoModule() {
            return this._cryptoModule;
        },
        get useRandomIVs() {
            return base.useRandomIVs;
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
            return '7.6.0';
        },
        getVersion() {
            return this.version;
        },
        _addPnsdkSuffix(name, suffix) {
            this._pnsdkSuffix[name] = `${suffix}`;
        },
        _getPnsdkSuffix(separator) {
            return Object.values(this._pnsdkSuffix).join(separator);
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
        get customEncrypt() {
            return base.customEncrypt;
        },
        get customDecrypt() {
            return base.customDecrypt;
        } });
    // Setup `CryptoModule` if possible.
    if (base.cipherKey)
        clientConfiguration.setCipherKey(base.cipherKey);
    return clientConfiguration;
};
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
