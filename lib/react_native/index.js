"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_encoding_1 = require("text-encoding");
require("react-native-url-polyfill/auto");
const cbor_js_1 = __importDefault(require("cbor-js"));
const buffer_1 = require("buffer");
const stringify_buffer_keys_1 = require("../core/components/stringify_buffer_keys");
const react_native_transport_1 = require("../transport/react-native-transport");
const configuration_1 = require("../core/components/configuration");
const token_manager_1 = require("../core/components/token_manager");
const middleware_1 = require("../transport/middleware");
const base64_codec_1 = require("../core/components/base64_codec");
const react_native_1 = __importDefault(require("../file/modules/react-native"));
const cryptography_1 = __importDefault(require("../core/components/cryptography"));
const LegacyCryptoModule_1 = __importDefault(require("../crypto/modules/LegacyCryptoModule"));
const pubnub_common_1 = require("../core/pubnub-common");
const configuration_2 = require("./configuration");
const common_1 = __importDefault(require("../cbor/common"));
// Polyfill global environment
global.TextEncoder = global.TextEncoder || text_encoding_1.TextEncoder;
global.TextDecoder = global.TextDecoder || text_encoding_1.TextDecoder;
global.Buffer = global.Buffer || buffer_1.Buffer;
/**
 * PubNub client for React Native platform.
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
        const configurationCopy = (0, configuration_2.setDefaults)(configuration);
        const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'ReactNative' });
        if (process.env.FILE_SHARING_MODULE !== 'disabled')
            platformConfiguration.PubNubFile = react_native_1.default;
        // Prepare full client configuration.
        // Install a CryptoModule on RN when a cipherKey is provided by adapting legacy Crypto.
        const clientConfiguration = (0, configuration_1.makeConfiguration)(platformConfiguration, (cryptoConfiguration) => {
            if (!cryptoConfiguration.cipherKey)
                return undefined;
            if (process.env.CRYPTO_MODULE !== 'disabled') {
                const legacy = new cryptography_1.default({
                    secretKey: platformConfiguration.secretKey,
                    cipherKey: cryptoConfiguration.cipherKey,
                    useRandomIVs: platformConfiguration.useRandomIVs,
                    customEncrypt: platformConfiguration.customEncrypt,
                    customDecrypt: platformConfiguration.customDecrypt,
                    logger: cryptoConfiguration.logger,
                });
                return new LegacyCryptoModule_1.default(legacy);
            }
            return undefined;
        });
        // Prepare Token manager.
        let tokenManager;
        if (process.env.CRYPTO_MODULE !== 'disabled') {
            tokenManager = new token_manager_1.TokenManager(new common_1.default((arrayBuffer) => (0, stringify_buffer_keys_1.stringifyBufferKeys)(cbor_js_1.default.decode(arrayBuffer)), base64_codec_1.decode));
        }
        // Legacy crypto (legacy data encryption / decryption and request signature support).
        let crypto;
        if (process.env.CRYPTO_MODULE !== 'disabled') {
            if (clientConfiguration.getCipherKey() || clientConfiguration.secretKey) {
                crypto = new cryptography_1.default({
                    secretKey: clientConfiguration.secretKey,
                    cipherKey: clientConfiguration.getCipherKey(),
                    useRandomIVs: clientConfiguration.getUseRandomIVs(),
                    customEncrypt: clientConfiguration.getCustomEncrypt(),
                    customDecrypt: clientConfiguration.getCustomDecrypt(),
                    logger: clientConfiguration.logger(),
                });
            }
        }
        // Setup transport layer.
        const transportMiddleware = new middleware_1.PubNubMiddleware({
            clientConfiguration,
            tokenManager,
            shaHMAC: process.env.CRYPTO_MODULE !== 'disabled' ? crypto === null || crypto === void 0 ? void 0 : crypto.HMACSHA256.bind(crypto) : undefined,
            transport: new react_native_transport_1.ReactNativeTransport(clientConfiguration.logger(), clientConfiguration.keepAlive),
        });
        super({
            configuration: clientConfiguration,
            transport: transportMiddleware,
            tokenManager,
            crypto,
        });
    }
}
/**
 * Exponential retry policy constructor.
 */
PubNub.ExponentialRetryPolicy = pubnub_common_1.PubNubCore.ExponentialRetryPolicy;
/**
 * Linear retry policy constructor.
 */
PubNub.LinearRetryPolicy = pubnub_common_1.PubNubCore.LinearRetryPolicy;
/**
 * Disabled / inactive retry policy.
 */
PubNub.NoneRetryPolicy = pubnub_common_1.PubNubCore.NoneRetryPolicy;
/**
 * API call status category.
 */
PubNub.CATEGORIES = pubnub_common_1.PubNubCore.CATEGORIES;
/**
 * Enum with API endpoint groups which can be used with retry policy to set up exclusions.
 */
PubNub.Endpoint = pubnub_common_1.PubNubCore.Endpoint;
/**
 * Available minimum log levels.
 */
PubNub.LogLevel = pubnub_common_1.PubNubCore.LogLevel;
/**
 * Type of REST API endpoint which reported status.
 */
PubNub.OPERATIONS = pubnub_common_1.PubNubCore.OPERATIONS;
/**
 * Generate unique identifier.
 */
PubNub.generateUUID = pubnub_common_1.PubNubCore.generateUUID;
/**
 * Construct notification payload which will trigger push notification.
 */
PubNub.notificationPayload = pubnub_common_1.PubNubCore.notificationPayload;
exports.default = PubNub;
