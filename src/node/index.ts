import { ProxyAgentOptions } from 'proxy-agent';
import CborReader from 'cbor-sync';
import { Readable } from 'stream';
import { Buffer } from 'buffer';

import { CryptoModule, LegacyCryptor, AesCbcCryptor } from '../crypto/modules/NodeCryptoModule/nodeCryptoModule';
import PubNubFile, { PubNubFileParameters } from '../file/modules/node';
import { CryptorConfiguration } from '../core/interfaces/crypto-module';
import { makeConfiguration } from '../core/components/configuration';
import { PubNubConfiguration, setDefaults } from './configuration';
import { TokenManager } from '../core/components/token_manager';
import { NodeTransport } from '../transport/node-transport';
import { PubNubMiddleware } from '../transport/middleware';
import { PubNubFileConstructor } from '../core/types/file';
import { decode } from '../core/components/base64_codec';
import NodeCryptography from '../crypto/modules/node';
import Crypto from '../core/components/cryptography';
import { PubNubError } from '../errors/pubnub-error';
import { PubNubCore } from '../core/pubnub-common';
import Cbor from '../cbor/common';

/**
 * PubNub client for Node.js platform.
 */
class PubNub extends PubNubCore<string | ArrayBuffer | Buffer | Readable, PubNubFileParameters, PubNubFile> {
  /**
   * Data encryption / decryption module constructor.
   */
  static CryptoModule = CryptoModule;

  /**
   * PubNub File constructor.
   */
  public File: PubNubFileConstructor<PubNubFile, PubNubFileParameters> = PubNubFile;

  /**
   * Actual underlying transport provider.
   */
  private nodeTransport: NodeTransport;

  constructor(configuration: PubNubConfiguration) {
    const configurationCopy = setDefaults(configuration);
    const platformConfiguration = { ...configurationCopy, sdkFamily: 'Nodejs', PubNubFile };

    // Prepare full client configuration.
    const clientConfiguration = makeConfiguration(
      platformConfiguration,
      (cryptoConfiguration: CryptorConfiguration) => {
        if (!cryptoConfiguration.cipherKey) return undefined;

        return new CryptoModule({
          default: new LegacyCryptor({ ...cryptoConfiguration }),
          cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
        });
      },
    );

    // Prepare Token manager.
    const tokenManager = new TokenManager(
      new Cbor((buffer: ArrayBuffer) => CborReader.decode(Buffer.from(buffer)), decode),
    );

    // Legacy crypto (legacy data encryption / decryption and request signature support).
    const crypto = new Crypto({
      secretKey: clientConfiguration.secretKey,
      cipherKey: clientConfiguration.getCipherKey(),
      useRandomIVs: clientConfiguration.getUseRandomIVs(),
      customEncrypt: clientConfiguration.getCustomEncrypt(),
      customDecrypt: clientConfiguration.getCustomDecrypt(),
    });

    // Setup transport provider.
    const transport = new NodeTransport(configuration.keepAlive, configuration.keepAliveSettings);
    const transportMiddleware = new PubNubMiddleware({
      clientConfiguration,
      tokenManager,
      transport,
      shaHMAC: crypto?.HMACSHA256.bind(crypto),
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
  public setProxy(configuration?: ProxyAgentOptions) {
    if (configuration && (this._configuration.keepAlive ?? false))
      throw new PubNubError("Can't set 'proxy' because already configured for 'keepAlive'");

    this.nodeTransport.setProxy(configuration);
    this.reconnect();
  }
}

export = PubNub;
