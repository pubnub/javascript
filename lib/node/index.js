"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const cbor_sync_1 = __importDefault(require("cbor-sync"));
const buffer_1 = require("buffer");
const nodeCryptoModule_1 = require("../crypto/modules/NodeCryptoModule/nodeCryptoModule");
const node_1 = __importDefault(require("../file/modules/node"));
const configuration_1 = require("../core/components/configuration");
const configuration_2 = require("./configuration");
const token_manager_1 = require("../core/components/token_manager");
const node_transport_1 = require("../transport/node-transport");
const middleware_1 = require("../transport/middleware");
const base64_codec_1 = require("../core/components/base64_codec");
const node_2 = __importDefault(require("../crypto/modules/node"));
const cryptography_1 = __importDefault(require("../core/components/cryptography"));
const pubnub_error_1 = require("../errors/pubnub-error");
const pubnub_common_1 = require("../core/pubnub-common");
const common_1 = __importDefault(require("../cbor/common"));
/**
 * PubNub client for Node.js platform.
 */
class PubNub extends pubnub_common_1.PubNubCore {
    constructor(configuration) {
        const configurationCopy = (0, configuration_2.setDefaults)(configuration);
        const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'Nodejs' });
        if (process.env.FILE_SHARING_MODULE !== 'disabled')
            platformConfiguration.PubNubFile = node_1.default;
        // Prepare full client configuration.
        const clientConfiguration = (0, configuration_1.makeConfiguration)(platformConfiguration, (cryptoConfiguration) => {
            if (!cryptoConfiguration.cipherKey)
                return undefined;
            if (process.env.CRYPTO_MODULE !== 'disabled') {
                return new nodeCryptoModule_1.CryptoModule({
                    default: new nodeCryptoModule_1.LegacyCryptor(Object.assign({}, cryptoConfiguration)),
                    cryptors: [new nodeCryptoModule_1.AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
                });
            }
            else
                return undefined;
        });
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
            });
        }
        let cryptography;
        if (process.env.CRYPTO_MODULE !== 'disabled')
            cryptography = new node_2.default();
        // Setup transport provider.
        const transport = new node_transport_1.NodeTransport(configuration.keepAlive, configuration.keepAliveSettings);
        const transportMiddleware = new middleware_1.PubNubMiddleware({
            clientConfiguration,
            tokenManager,
            transport,
            shaHMAC: process.env.CRYPTO_MODULE !== 'disabled' ? crypto === null || crypto === void 0 ? void 0 : crypto.HMACSHA256.bind(crypto) : undefined,
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
PubNub.CryptoModule = process.env.CRYPTO_MODULE !== 'disabled' ? nodeCryptoModule_1.CryptoModule : undefined;
module.exports = PubNub;
