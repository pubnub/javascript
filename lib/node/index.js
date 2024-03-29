"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var cbor_sync_1 = __importDefault(require("cbor-sync"));
var buffer_1 = require("buffer");
var nodeCryptoModule_1 = require("../crypto/modules/NodeCryptoModule/nodeCryptoModule");
var node_1 = __importDefault(require("../file/modules/node"));
var configuration_1 = require("../core/components/configuration");
var configuration_2 = require("./configuration");
var token_manager_1 = __importDefault(require("../core/components/token_manager"));
var node_transport_1 = require("../transport/node-transport");
var middleware_1 = require("../transport/middleware");
var base64_codec_1 = require("../core/components/base64_codec");
var node_2 = __importDefault(require("../crypto/modules/node"));
var cryptography_1 = __importDefault(require("../core/components/cryptography"));
var PubNubError_1 = require("../models/PubNubError");
var pubnub_common_1 = require("../core/pubnub-common");
var common_1 = __importDefault(require("../cbor/common"));
/**
 * PubNub client for Node.js platform.
 */
var PubNub = /** @class */ (function (_super) {
    __extends(PubNub, _super);
    function PubNub(configuration) {
        var _this = this;
        var configurationCopy = (0, configuration_2.setDefaults)(configuration);
        var platformConfiguration = __assign(__assign({}, configurationCopy), { sdkFamily: 'Nodejs', PubNubFile: node_1.default });
        // Prepare full client configuration.
        var clientConfiguration = (0, configuration_1.makeConfiguration)(platformConfiguration, function (cryptoConfiguration) {
            if (!cryptoConfiguration.cipherKey)
                return undefined;
            return new nodeCryptoModule_1.CryptoModule({
                default: new nodeCryptoModule_1.LegacyCryptor(__assign({}, cryptoConfiguration)),
                cryptors: [new nodeCryptoModule_1.AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
            });
        });
        // Prepare Token manager.
        var tokenManager = new token_manager_1.default(new common_1.default(function (buffer) { return cbor_sync_1.default.decode(buffer_1.Buffer.from(buffer)); }, base64_codec_1.decode));
        // Legacy crypto (legacy data encryption / decryption and request signature support).
        var crypto;
        if (clientConfiguration.cipherKey || clientConfiguration.secretKey) {
            var secretKey = clientConfiguration.secretKey, cipherKey = clientConfiguration.cipherKey, useRandomIVs = clientConfiguration.useRandomIVs, customEncrypt = clientConfiguration.customEncrypt, customDecrypt = clientConfiguration.customDecrypt;
            crypto = new cryptography_1.default({ secretKey: secretKey, cipherKey: cipherKey, useRandomIVs: useRandomIVs, customEncrypt: customEncrypt, customDecrypt: customDecrypt });
        }
        // Setup transport provider.
        var transport = new node_transport_1.NodeTransport(configuration.keepAlive, configuration.keepAliveSettings);
        var transportMiddleware = new middleware_1.PubNubMiddleware({
            clientConfiguration: clientConfiguration,
            tokenManager: tokenManager,
            transport: transport,
            shaHMAC: crypto === null || crypto === void 0 ? void 0 : crypto.HMACSHA256,
        });
        _this = _super.call(this, {
            configuration: clientConfiguration,
            transport: transportMiddleware,
            cryptography: new node_2.default(),
            tokenManager: tokenManager,
            crypto: crypto,
        }) || this;
        _this.nodeTransport = transport;
        return _this;
    }
    /**
     * Update request proxy configuration.
     *
     * @param configuration - Updated request proxy configuration.
     *
     * @throws An error if {@link PubNub} client already configured to use `keepAlive`.
     * `keepAlive` and `proxy` can't be used simultaneously.
     */
    PubNub.prototype.setProxy = function (configuration) {
        var _a;
        if (configuration && ((_a = this._configuration.keepAlive) !== null && _a !== void 0 ? _a : false))
            throw new PubNubError_1.PubNubError("Can't set 'proxy' because already configured for 'keepAlive'");
        this.nodeTransport.setProxy(configuration);
        this.reconnect();
    };
    /**
     * Data encryption / decryption module constructor.
     */
    PubNub.CryptoModule = nodeCryptoModule_1.CryptoModule;
    return PubNub;
}(pubnub_common_1.PubNubCore));
exports.default = PubNub;
