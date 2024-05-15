/* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
/* global navigator */

import CborReader from 'cbor-js';

// eslint-disable-next-line max-len
import { AesCbcCryptor, LegacyCryptor, WebCryptoModule } from '../crypto/modules/WebCryptoModule/webCryptoModule';
import { SubscriptionWorkerMiddleware } from '../transport/subscription-worker/subscription-worker-middleware';
import { WebReactNativeTransport } from '../transport/web-react-native-transport';
import { stringifyBufferKeys } from '../core/components/stringify_buffer_keys';
import { PubNubConfiguration, setDefaults } from './components/configuration';
import { CryptorConfiguration } from '../core/interfaces/crypto-module';
import { PubNubFile, PubNubFileParameters } from '../file/modules/web';
import { makeConfiguration } from '../core/components/configuration';
import { TokenManager } from '../core/components/token_manager';
import { PubNubMiddleware } from '../transport/middleware';
import { decode } from '../core/components/base64_codec';
import { Transport } from '../core/interfaces/transport';
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
    if (clientConfiguration.getCipherKey() || clientConfiguration.secretKey) {
      crypto = new Crypto({
        secretKey: clientConfiguration.secretKey,
        cipherKey: clientConfiguration.getCipherKey(),
        useRandomIVs: clientConfiguration.getUseRandomIVs(),
        customEncrypt: clientConfiguration.getCustomEncrypt(),
        customDecrypt: clientConfiguration.getCustomDecrypt(),
      });
    }

    // Setup transport provider.
    let transport: Transport = new WebReactNativeTransport(
      clientConfiguration.keepAlive,
      clientConfiguration.logVerbosity!,
    );

    if (configurationCopy.subscriptionWorkerUrl) {
      // Inject subscription worker into transport provider stack.
      transport = new SubscriptionWorkerMiddleware({
        clientIdentifier: clientConfiguration._instanceId,
        subscriptionKey: clientConfiguration.subscribeKey,
        userId: clientConfiguration.getUserId(),
        workerUrl: configurationCopy.subscriptionWorkerUrl,
        sdkVersion: clientConfiguration.getVersion(),
        logVerbosity: clientConfiguration.logVerbosity!,
        workerLogVerbosity: platformConfiguration.subscriptionWorkerLogVerbosity!,
        transport,
      });
    }

    const transportMiddleware = new PubNubMiddleware({
      clientConfiguration,
      tokenManager,
      transport,
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
