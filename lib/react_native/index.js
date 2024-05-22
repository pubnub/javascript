"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_encoding_1 = require("text-encoding");
require("react-native-url-polyfill/auto");
const cbor_js_1 = __importDefault(require("cbor-js"));
const buffer_1 = require("buffer");
const web_react_native_transport_1 = require("../transport/web-react-native-transport");
const stringify_buffer_keys_1 = require("../core/components/stringify_buffer_keys");
const configuration_1 = require("../core/components/configuration");
const token_manager_1 = require("../core/components/token_manager");
const middleware_1 = require("../transport/middleware");
const base64_codec_1 = require("../core/components/base64_codec");
const react_native_1 = __importDefault(require("../file/modules/react-native"));
const cryptography_1 = __importDefault(require("../core/components/cryptography"));
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
    constructor(configuration) {
        const configurationCopy = (0, configuration_2.setDefaults)(configuration);
        const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'ReactNative' });
        if (process.env.FILE_SHARING_MODULE !== 'disabled')
            platformConfiguration.PubNubFile = react_native_1.default;
        // Prepare full client configuration.
        const clientConfiguration = (0, configuration_1.makeConfiguration)(platformConfiguration);
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
                });
            }
        }
        // Setup transport layer.
        const transportMiddleware = new middleware_1.PubNubMiddleware({
            clientConfiguration,
            tokenManager,
            transport: new web_react_native_transport_1.WebReactNativeTransport(clientConfiguration.keepAlive, clientConfiguration.logVerbosity),
        });
        super({
            configuration: clientConfiguration,
            transport: transportMiddleware,
            tokenManager,
            crypto,
        });
    }
}
exports.default = PubNub;
