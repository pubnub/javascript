"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
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
module.exports = (_a = class PubNub extends pubnub_common_1.PubNubCore {
        constructor(configuration) {
            const configurationCopy = (0, configuration_2.setDefaults)(configuration);
            const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'Nodejs', PubNubFile: node_1.default });
            const clientConfiguration = (0, configuration_1.makeConfiguration)(platformConfiguration, (cryptoConfiguration) => {
                if (!cryptoConfiguration.cipherKey)
                    return undefined;
                return new nodeCryptoModule_1.CryptoModule({
                    default: new nodeCryptoModule_1.LegacyCryptor(Object.assign({}, cryptoConfiguration)),
                    cryptors: [new nodeCryptoModule_1.AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
                });
            });
            const tokenManager = new token_manager_1.TokenManager(new common_1.default((buffer) => cbor_sync_1.default.decode(buffer_1.Buffer.from(buffer)), base64_codec_1.decode));
            const crypto = new cryptography_1.default({
                secretKey: clientConfiguration.secretKey,
                cipherKey: clientConfiguration.getCipherKey(),
                useRandomIVs: clientConfiguration.getUseRandomIVs(),
                customEncrypt: clientConfiguration.getCustomEncrypt(),
                customDecrypt: clientConfiguration.getCustomDecrypt(),
            });
            const transport = new node_transport_1.NodeTransport(configuration.keepAlive, configuration.keepAliveSettings);
            const transportMiddleware = new middleware_1.PubNubMiddleware({
                clientConfiguration,
                tokenManager,
                transport,
                shaHMAC: crypto === null || crypto === void 0 ? void 0 : crypto.HMACSHA256.bind(crypto),
            });
            super({
                configuration: clientConfiguration,
                transport: transportMiddleware,
                cryptography: new node_2.default(),
                tokenManager,
                crypto,
            });
            this.File = node_1.default;
            this.nodeTransport = transport;
        }
        setProxy(configuration) {
            var _b;
            if (configuration && ((_b = this._configuration.keepAlive) !== null && _b !== void 0 ? _b : false))
                throw new pubnub_error_1.PubNubError("Can't set 'proxy' because already configured for 'keepAlive'");
            this.nodeTransport.setProxy(configuration);
            this.reconnect();
        }
    },
    _a.CryptoModule = nodeCryptoModule_1.CryptoModule,
    _a);
