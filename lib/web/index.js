"use strict";
/* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
/* global navigator, window */
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
var cbor_js_1 = __importDefault(require("cbor-js"));
var webCryptoModule_1 = require("../crypto/modules/WebCryptoModule/webCryptoModule");
var stringify_buffer_keys_1 = require("../core/components/stringify_buffer_keys");
var web_1 = require("../file/modules/web");
var configuration_1 = require("../core/components/configuration");
var configuration_2 = require("./configuration");
var token_manager_1 = __importDefault(require("../core/components/token_manager"));
var middleware_1 = require("../transport/middleware");
var web_transport_1 = require("../transport/web-transport");
var base64_codec_1 = require("../core/components/base64_codec");
var cryptography_1 = __importDefault(require("../core/components/cryptography"));
var web_2 = __importDefault(require("../crypto/modules/web"));
var pubnub_common_1 = require("../core/pubnub-common");
var common_1 = __importDefault(require("../cbor/common"));
/**
 * PubNub client for browser platform.
 */
var PubNub = /** @class */ (function (_super) {
    __extends(PubNub, _super);
    function PubNub(configuration) {
        var _this = this;
        var _a;
        var configurationCopy = (0, configuration_2.setDefaults)(configuration);
        var platformConfiguration = __assign(__assign({}, configurationCopy), { sdkFamily: 'Nodejs', PubNubFile: web_1.PubNubFile });
        // Prepare full client configuration.
        var clientConfiguration = (0, configuration_1.makeConfiguration)(platformConfiguration, function (cryptoConfiguration) {
            if (!cryptoConfiguration.cipherKey)
                return undefined;
            return new webCryptoModule_1.WebCryptoModule({
                default: new webCryptoModule_1.LegacyCryptor(__assign({}, cryptoConfiguration)),
                cryptors: [new webCryptoModule_1.AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
            });
        });
        // Prepare Token manager.
        var tokenManager = new token_manager_1.default(new common_1.default(function (arrayBuffer) { return (0, stringify_buffer_keys_1.stringifyBufferKeys)(cbor_js_1.default.decode(arrayBuffer)); }, base64_codec_1.decode));
        // Legacy crypto (legacy data encryption / decryption and request signature support).
        var crypto;
        if (clientConfiguration.cipherKey || clientConfiguration.secretKey) {
            var secretKey = clientConfiguration.secretKey, cipherKey = clientConfiguration.cipherKey, useRandomIVs = clientConfiguration.useRandomIVs, customEncrypt = clientConfiguration.customEncrypt, customDecrypt = clientConfiguration.customDecrypt;
            crypto = new cryptography_1.default({ secretKey: secretKey, cipherKey: cipherKey, useRandomIVs: useRandomIVs, customEncrypt: customEncrypt, customDecrypt: customDecrypt });
        }
        // Setup transport provider.
        var transportMiddleware = new middleware_1.PubNubMiddleware({
            clientConfiguration: clientConfiguration,
            tokenManager: tokenManager,
            transport: new web_transport_1.WebTransport(clientConfiguration.keepAlive, clientConfiguration.logVerbosity),
        });
        _this = _super.call(this, {
            configuration: clientConfiguration,
            transport: transportMiddleware,
            cryptography: new web_2.default(),
            tokenManager: tokenManager,
            crypto: crypto,
        }) || this;
        if ((_a = configuration.listenToBrowserNetworkEvents) !== null && _a !== void 0 ? _a : true) {
            window.addEventListener('offline', function () {
                _this.networkDownDetected();
            });
            window.addEventListener('online', function () {
                _this.networkUpDetected();
            });
        }
        return _this;
    }
    PubNub.prototype.networkDownDetected = function () {
        this.listenerManager.announceNetworkDown();
        if (this._configuration.restore)
            this.disconnect();
        else
            this.destroy(true);
    };
    PubNub.prototype.networkUpDetected = function () {
        this.listenerManager.announceNetworkUp();
        this.reconnect();
    };
    /**
     * Data encryption / decryption module constructor.
     */
    PubNub.CryptoModule = webCryptoModule_1.WebCryptoModule;
    return PubNub;
}(pubnub_common_1.PubNubCore));
exports.default = PubNub;
