import CborReader from 'cbor-sync';
import { Buffer } from 'buffer';
import { CryptoModule, LegacyCryptor, AesCbcCryptor } from '../crypto/modules/NodeCryptoModule/nodeCryptoModule';
import PubNubFile from '../file/modules/node';
import { makeConfiguration } from '../core/components/configuration';
import { setDefaults } from './configuration';
import TokenManager from '../core/components/token_manager';
import { NodeTransport } from '../transport/node-transport';
import { PubNubMiddleware } from '../transport/middleware';
import { decode } from '../core/components/base64_codec';
import NodeCryptography from '../crypto/modules/node';
import Crypto from '../core/components/cryptography';
import { PubnubError } from '../errors/pubnub-error';
import { PubNubCore } from '../core/pubnub-common';
import Cbor from '../cbor/common';
/**
 * PubNub client for Node.js platform.
 */
class PubNub extends PubNubCore {
    constructor(configuration) {
        const configurationCopy = setDefaults(configuration);
        const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'Nodejs', PubNubFile });
        // Prepare full client configuration.
        const clientConfiguration = makeConfiguration(platformConfiguration, (cryptoConfiguration) => {
            if (!cryptoConfiguration.cipherKey)
                return undefined;
            return new CryptoModule({
                default: new LegacyCryptor(Object.assign({}, cryptoConfiguration)),
                cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
            });
        });
        // Prepare Token manager.
        const tokenManager = new TokenManager(new Cbor((buffer) => CborReader.decode(Buffer.from(buffer)), decode));
        // Legacy crypto (legacy data encryption / decryption and request signature support).
        let crypto;
        if (clientConfiguration.cipherKey || clientConfiguration.secretKey) {
            const { secretKey, cipherKey, useRandomIVs, customEncrypt, customDecrypt } = clientConfiguration;
            crypto = new Crypto({ secretKey, cipherKey, useRandomIVs, customEncrypt, customDecrypt });
        }
        // Setup transport provider.
        const transport = new NodeTransport(configuration.keepAlive, configuration.keepAliveSettings);
        const transportMiddleware = new PubNubMiddleware({
            clientConfiguration,
            tokenManager,
            transport,
            shaHMAC: crypto === null || crypto === void 0 ? void 0 : crypto.HMACSHA256,
        });
        super({
            configuration: clientConfiguration,
            transport: transportMiddleware,
            cryptography: new NodeCryptography(),
            tokenManager,
            crypto,
        });
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
            throw new PubnubError("Can't set 'proxy' because already configured for 'keepAlive'");
        this.nodeTransport.setProxy(configuration);
        this.reconnect();
    }
}
/**
 * Data encryption / decryption module constructor.
 */
PubNub.CryptoModule = CryptoModule;
export default PubNub;
