/* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
/* global navigator, window */

import CborReader from 'cbor-js';

import { WebCryptoModule, LegacyCryptor, AesCbcCryptor } from '../crypto/modules/WebCryptoModule/webCryptoModule';
import { stringifyBufferKeys } from '../core/components/stringify_buffer_keys';
import { CryptorConfiguration } from '../core/interfaces/crypto-module';
import { PubNubFileParameters, PubNubFile } from '../file/modules/web';
import { makeConfiguration } from '../core/components/configuration';
import { PubNubConfiguration, setDefaults } from './configuration';
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
export default class PubNub extends PubNubCore<ArrayBuffer | string, PubNubFileParameters, PubNubFile> {
  /**
   * Data encryption / decryption module constructor.
   */
  static CryptoModule = WebCryptoModule;

  constructor(configuration: PubNubConfiguration) {
    const configurationCopy = setDefaults(configuration);
    const platformConfiguration = { ...configurationCopy, sdkFamily: 'Web', PubNubFile };

    // Prepare full client configuration.
    const clientConfiguration = makeConfiguration(
      platformConfiguration,
      (cryptoConfiguration: CryptorConfiguration) => {
        if (!cryptoConfiguration.cipherKey) return undefined;

        return new WebCryptoModule({
          default: new LegacyCryptor({ ...cryptoConfiguration }),
          cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
        });
      },
    );

    // Prepare Token manager.
    const tokenManager = new TokenManager(
      new Cbor((arrayBuffer: ArrayBuffer) => stringifyBufferKeys(CborReader.decode(arrayBuffer)), decode),
    );

    // Legacy crypto (legacy data encryption / decryption and request signature support).
    let crypto: Crypto | undefined;
    if (clientConfiguration.cipherKey || clientConfiguration.secretKey) {
      const { secretKey, cipherKey, useRandomIVs, customEncrypt, customDecrypt } = clientConfiguration;
      crypto = new Crypto({ secretKey, cipherKey, useRandomIVs, customEncrypt, customDecrypt });
    }

    // Setup transport provider.
    const transportMiddleware = new PubNubMiddleware({
      clientConfiguration,
      tokenManager,
      transport: new WebTransport(clientConfiguration.keepAlive, clientConfiguration.logVerbosity!),
    });

    super({
      configuration: clientConfiguration,
      transport: transportMiddleware,
      cryptography: new WebCryptography(),
      tokenManager,
      crypto,
    });

    if (configuration.listenToBrowserNetworkEvents ?? true) {
      window.addEventListener('offline', () => {
        this.networkDownDetected();
      });

      window.addEventListener('online', () => {
        this.networkUpDetected();
      });
    }
  }

  private networkDownDetected() {
    this.listenerManager.announceNetworkDown();

    if (this._configuration.restore) this.disconnect();
    else this.destroy(true);
  }

  private networkUpDetected() {
    this.listenerManager.announceNetworkUp();
    this.reconnect();
  }
}
