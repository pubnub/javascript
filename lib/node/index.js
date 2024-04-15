import CborReader from 'cbor-sync';
import { Buffer } from 'buffer';
import { CryptoModule, LegacyCryptor, AesCbcCryptor } from '../crypto/modules/NodeCryptoModule/nodeCryptoModule';
import PubNubFile from '../file/modules/node';
import { makeConfiguration } from '../core/components/configuration';
import { setDefaults } from './configuration';
import { TokenManager } from '../core/components/token_manager';
import { NodeTransport } from '../transport/node-transport';
import { PubNubMiddleware } from '../transport/middleware';
import { decode } from '../core/components/base64_codec';
import NodeCryptography from '../crypto/modules/node';
import Crypto from '../core/components/cryptography';
import { PubNubError } from '../errors/pubnub-error';
import { PubNubCore } from '../core/pubnub-common';
import Cbor from '../cbor/common';
class PubNub extends PubNubCore {
    constructor(configuration) {
        const configurationCopy = setDefaults(configuration);
        const platformConfiguration = Object.assign(Object.assign({}, configurationCopy), { sdkFamily: 'Nodejs', PubNubFile });
        const clientConfiguration = makeConfiguration(platformConfiguration, (cryptoConfiguration) => {
            if (!cryptoConfiguration.cipherKey)
                return undefined;
            return new CryptoModule({
                default: new LegacyCryptor(Object.assign({}, cryptoConfiguration)),
                cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
            });
        });
        const tokenManager = new TokenManager(new Cbor((buffer) => CborReader.decode(Buffer.from(buffer)), decode));
        const crypto = new Crypto({
            secretKey: clientConfiguration.secretKey,
            cipherKey: clientConfiguration.getCipherKey(),
            useRandomIVs: clientConfiguration.getUseRandomIVs(),
            customEncrypt: clientConfiguration.getCustomEncrypt(),
            customDecrypt: clientConfiguration.getCustomDecrypt(),
        });
        const transport = new NodeTransport(configuration.keepAlive, configuration.keepAliveSettings);
        const transportMiddleware = new PubNubMiddleware({
            clientConfiguration,
            tokenManager,
            transport,
            shaHMAC: crypto === null || crypto === void 0 ? void 0 : crypto.HMACSHA256.bind(crypto),
        });
        super({
            configuration: clientConfiguration,
            transport: transportMiddleware,
            cryptography: new NodeCryptography(),
            tokenManager,
            crypto,
        });
        this.File = PubNubFile;
        this.nodeTransport = transport;
    }
    setProxy(configuration) {
        var _a;
        if (configuration && ((_a = this._configuration.keepAlive) !== null && _a !== void 0 ? _a : false))
            throw new PubNubError("Can't set 'proxy' because already configured for 'keepAlive'");
        this.nodeTransport.setProxy(configuration);
        this.reconnect();
    }
}
PubNub.CryptoModule = CryptoModule;
export default PubNub;
