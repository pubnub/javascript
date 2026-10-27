"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const cbor_sync_1 = __importDefault(require("cbor-sync"));
const buffer_1 = require("buffer");
const nodeCryptoModule_1 = require("../crypto/modules/NodeCryptoModule/nodeCryptoModule");
const configuration_1 = require("./components/configuration");
const node_1 = __importDefault(require("../file/modules/node"));
const configuration_2 = require("../core/components/configuration");
const token_manager_1 = require("../core/components/token_manager");
const node_transport_1 = require("../transport/node-transport");
const middleware_1 = require("../transport/middleware");
const base64_codec_1 = require("../core/components/base64_codec");
const node_2 = __importDefault(require("../crypto/modules/node"));
const cryptography_1 = __importDefault(require("../core/components/cryptography"));
const node_3 = __importStar(require("../crypto/primitives/node"));
const pubnub_error_1 = require("../errors/pubnub-error");
const pubnub_common_1 = require("../core/pubnub-common");
const common_1 = __importDefault(require("../cbor/common"));
/**
 * PubNub client for Node.js platform.
 */
class PubNub extends pubnub_common_1.PubNubCore {
    /**
     * Create and configure PubNub client core.
     *
     * @param configuration - User-provided PubNub client configuration.
     *
     * @returns Configured and ready to use PubNub client.
     */
    constructor(configuration) {
        const configurationCopy = (0, configuration_1.setDefaults)(configuration);
        const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'Nodejs' });
        if (process.env.FILE_SHARING_MODULE !== 'disabled')
            platformConfiguration.PubNubFile = node_1.default;
        // Prepare full client configuration.
        const clientConfiguration = (0, configuration_2.makeConfiguration)(platformConfiguration, (cryptoConfiguration) => {
            if (!cryptoConfiguration.cipherKey)
                return undefined;
            if (process.env.CRYPTO_MODULE !== 'disabled') {
                return new nodeCryptoModule_1.NodeCryptoModule({
                    default: new nodeCryptoModule_1.LegacyCryptor(Object.assign(Object.assign({}, cryptoConfiguration), (!cryptoConfiguration.logger ? { logger: clientConfiguration.logger() } : {}))),
                    cryptors: [new nodeCryptoModule_1.AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
                });
            }
            else
                return undefined;
        });
        if (process.env.CRYPTO_MODULE !== 'disabled') {
            // Ensure that the logger has been passed to the user-provided crypto module.
            if (clientConfiguration.getCryptoModule())
                clientConfiguration.getCryptoModule().logger = clientConfiguration.logger();
        }
        // Prepare Token manager.
        let tokenManager;
        if (process.env.CRYPTO_MODULE !== 'disabled') {
            tokenManager = new token_manager_1.TokenManager(new common_1.default((buffer) => cbor_sync_1.default.decode(buffer_1.Buffer.from(buffer)), base64_codec_1.decode));
        }
        // Legacy crypto (legacy data encryption / decryption and request signature support).
        let crypto;
        if (process.env.CRYPTO_MODULE !== 'disabled') {
            crypto = new cryptography_1.default({
                secretKey: clientConfiguration.secretKey,
                cipherKey: clientConfiguration.getCipherKey(),
                useRandomIVs: clientConfiguration.getUseRandomIVs(),
                customEncrypt: clientConfiguration.getCustomEncrypt(),
                customDecrypt: clientConfiguration.getCustomDecrypt(),
                logger: clientConfiguration.logger(),
            }, new node_3.default());
        }
        let cryptography;
        if (process.env.CRYPTO_MODULE !== 'disabled')
            cryptography = new node_2.default();
        // Setup transport provider.
        const transport = new node_transport_1.NodeTransport(clientConfiguration.logger(), configuration.keepAlive, configuration.keepAliveSettings);
        const transportMiddleware = new middleware_1.PubNubMiddleware({
            clientConfiguration,
            tokenManager,
            transport,
            shaHMAC: process.env.CRYPTO_MODULE !== 'disabled' ? node_3.hmacSha256 : undefined,
        });
        super({
            configuration: clientConfiguration,
            transport: transportMiddleware,
            cryptography,
            tokenManager,
            crypto,
        });
        /**
         * PubNub File constructor.
         */
        this.File = node_1.default;
        this.nodeTransport = transport;
    }
    /**
     * Update request proxy configuration.
     *
     * @param configuration - Updated request proxy configuration.
     *
     * @throws An error if {@link PubNub} client already configured to use `keepAlive`.
     * `keepAlive` and `proxy` can't be used simultaneously.
     */
    setProxy(configuration) {
        var _a;
        if (configuration && ((_a = this._configuration.keepAlive) !== null && _a !== void 0 ? _a : false))
            throw new pubnub_error_1.PubNubError("Can't set 'proxy' because already configured for 'keepAlive'");
        this.nodeTransport.setProxy(configuration);
        this.reconnect();
    }
}
/**
 * Data encryption / decryption module constructor.
 */
// @ts-expect-error Allowed to simplify interface when module can be disabled.
PubNub.CryptoModule = process.env.CRYPTO_MODULE !== 'disabled' ? nodeCryptoModule_1.NodeCryptoModule : undefined;
module.exports = PubNub;
