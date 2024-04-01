/* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
/* global navigator, window */
import CborReader from 'cbor-js';
import { WebCryptoModule, LegacyCryptor, AesCbcCryptor } from '../crypto/modules/WebCryptoModule/webCryptoModule';
import { stringifyBufferKeys } from '../core/components/stringify_buffer_keys';
import { PubNubFile } from '../file/modules/web';
import { makeConfiguration } from '../core/components/configuration';
import { setDefaults } from './configuration';
import TokenManager from '../core/components/token_manager';
import { PubNubMiddleware } from '../transport/middleware';
import { WebTransport } from '../transport/web-transport';
import { decode } from '../core/components/base64_codec';
import Crypto from '../core/components/cryptography';
import WebCryptography from '../crypto/modules/web';
import { PubNubCore } from '../core/pubnub-common';
import Cbor from '../cbor/common';
/**
 * PubNub client for browser platform.
 */
class PubNub extends PubNubCore {
    constructor(configuration) {
        var _a;
        const configurationCopy = setDefaults(configuration);
        const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'Nodejs', PubNubFile });
        // Prepare full client configuration.
        const clientConfiguration = makeConfiguration(platformConfiguration, (cryptoConfiguration) => {
            if (!cryptoConfiguration.cipherKey)
                return undefined;
            return new WebCryptoModule({
                default: new LegacyCryptor(Object.assign({}, cryptoConfiguration)),
                cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
            });
        });
        // Prepare Token manager.
        const tokenManager = new TokenManager(new Cbor((arrayBuffer) => stringifyBufferKeys(CborReader.decode(arrayBuffer)), decode));
        // Legacy crypto (legacy data encryption / decryption and request signature support).
        let crypto;
        if (clientConfiguration.cipherKey || clientConfiguration.secretKey) {
            const { secretKey, cipherKey, useRandomIVs, customEncrypt, customDecrypt } = clientConfiguration;
            crypto = new Crypto({ secretKey, cipherKey, useRandomIVs, customEncrypt, customDecrypt });
        }
        // Setup transport provider.
        const transportMiddleware = new PubNubMiddleware({
            clientConfiguration,
            tokenManager,
            transport: new WebTransport(clientConfiguration.keepAlive, clientConfiguration.logVerbosity),
        });
        super({
            configuration: clientConfiguration,
            transport: transportMiddleware,
            cryptography: new WebCryptography(),
            tokenManager,
            crypto,
        });
        if ((_a = configuration.listenToBrowserNetworkEvents) !== null && _a !== void 0 ? _a : true) {
            window.addEventListener('offline', () => {
                this.networkDownDetected();
            });
            window.addEventListener('online', () => {
                this.networkUpDetected();
            });
        }
    }
    networkDownDetected() {
        this.listenerManager.announceNetworkDown();
        if (this._configuration.restore)
            this.disconnect();
        else
            this.destroy(true);
    }
    networkUpDetected() {
        this.listenerManager.announceNetworkUp();
        this.reconnect();
    }
}
/**
 * Data encryption / decryption module constructor.
 */
PubNub.CryptoModule = WebCryptoModule;
export default PubNub;
