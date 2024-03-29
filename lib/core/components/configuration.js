"use strict";
/**
 * {@link PubNub} client configuration module.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeConfiguration = void 0;
var uuid_1 = __importDefault(require("./uuid"));
// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults
/**
 * Whether encryption (if set) should use random initialization vector or not.
 */
var USE_RANDOM_INITIALIZATION_VECTOR = true;
/**
 * Create {@link PubNub} client private configuration object.
 *
 * @param base - User- and platform-provided configuration.
 * @param setupCryptoModule - Platform-provided {@link CryptoModule} configuration block.
 *
 * @returns `PubNub` client private configuration.
 */
var makeConfiguration = function (base, setupCryptoModule) {
    var _a, _b, _c;
    // Ensure that retry policy has proper configuration (if has been set).
    (_a = base.retryConfiguration) === null || _a === void 0 ? void 0 : _a.validate();
    (_b = base.useRandomIVs) !== null && _b !== void 0 ? _b : (base.useRandomIVs = USE_RANDOM_INITIALIZATION_VECTOR);
    // Override origin value.
    base.origin = standardOrigin((_c = base.ssl) !== null && _c !== void 0 ? _c : false, base.origin);
    var clientConfiguration = __assign(__assign({}, base), { _pnsdkSuffix: {}, _instanceId: "pn-".concat(uuid_1.default.createUUID()), _cryptoModule: undefined, _cipherKey: undefined, _setupCryptoModule: setupCryptoModule, get instanceId() {
            if (this.useInstanceId)
                return this._instanceId;
            return undefined;
        }, getUserId: function () {
            return this.userId;
        }, setUserId: function (value) {
            if (!value || typeof value !== 'string' || value.trim().length === 0)
                throw new Error('Missing or invalid userId parameter. Provide a valid string userId');
            this.userId = value;
        }, getAuthKey: function () {
            return this.authKey;
        }, setAuthKey: function (authKey) {
            this.authKey = authKey;
        }, getFilterExpression: function () {
            return this.filterExpression;
        }, setFilterExpression: function (expression) {
            this.filterExpression = expression;
        }, get cipherKey() {
            return this._cipherKey;
        }, setCipherKey: function (key) {
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
        }, get cryptoModule() {
            return this._cryptoModule;
        },
        get useRandomIVs() {
            return base.useRandomIVs;
        }, getPresenceTimeout: function () {
            return this.presenceTimeout;
        }, getHeartbeatInterval: function () {
            return this.heartbeatInterval;
        }, setHeartbeatInterval: function (interval) {
            this.heartbeatInterval = interval;
        }, getTransactionTimeout: function () {
            return this.transactionalRequestTimeout;
        }, getSubscribeTimeout: function () {
            return this.subscribeRequestTimeout;
        }, get PubNubFile() {
            return this.PubNubFile;
        },
        get version() {
            return '7.6.0';
        }, getVersion: function () {
            return this.version;
        }, _addPnsdkSuffix: function (name, suffix) {
            this._pnsdkSuffix[name] = "".concat(suffix);
        }, _getPnsdkSuffix: function (separator) {
            return Object.values(this._pnsdkSuffix).join(separator);
        }, 
        // --------------------------------------------------------
        // ---------------------- Deprecated ----------------------
        // --------------------------------------------------------
        // region Deprecated
        getUUID: function () {
            return this.getUserId();
        }, setUUID: function (value) {
            this.setUserId(value);
        }, get customEncrypt() {
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
exports.makeConfiguration = makeConfiguration;
/**
 * Decide {@lin PubNub} service REST API origin.
 *
 * @param secure - Whether preferred to use secured connection or not.
 * @param origin - User-provided or default origin.
 *
 * @returns `PubNub` REST API endpoints origin.
 */
var standardOrigin = function (secure, origin) {
    var protocol = secure ? 'https://' : 'http://';
    if (typeof origin === 'string')
        return "".concat(protocol).concat(origin);
    return "".concat(protocol).concat(origin[Math.floor(Math.random() * origin.length)]);
};
