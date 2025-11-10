/* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
/* global navigator */

import CborReader from 'cbor-js';

import { WebCryptoModule, AesCbcCryptor, LegacyCryptor } from '../crypto/modules/WebCryptoModule/webCryptoModule';
import type { WebCryptoModule as CryptoModuleType } from '../crypto/modules/WebCryptoModule/webCryptoModule';

import { SubscriptionWorkerMiddleware } from '../transport/subscription-worker/subscription-worker-middleware';
import { ExtendedConfiguration, PlatformConfiguration } from '../core/interfaces/configuration';
import { stringifyBufferKeys } from '../core/components/stringify_buffer_keys';
import { PubNubConfiguration, setDefaults } from './components/configuration';
import { CryptorConfiguration } from '../core/interfaces/crypto-module';
import { PubNubFile, PubNubFileParameters } from '../file/modules/web';
import { makeConfiguration } from '../core/components/configuration';
import { TokenManager } from '../core/components/token_manager';
import { Cryptography } from '../core/interfaces/cryptography';
import { PubNubMiddleware } from '../transport/middleware';
import { WebTransport } from '../transport/web-transport';
import { decode } from '../core/components/base64_codec';
import { Transport } from '../core/interfaces/transport';
import { LogLevel } from '../core/interfaces/logger';
import Crypto from '../core/components/cryptography';
import WebCryptography from '../crypto/modules/web';
import { PubNubCore } from '../core/pubnub-common';
import Cbor from '../cbor/common';
import { Payload } from '../core/types/api';
import { PubNubFileConstructor } from '../core/types/file';

/**
 * PubNub client for browser platform.
 */
export default class PubNub extends PubNubCore<ArrayBuffer | string, PubNubFileParameters, PubNubFile> {
  /**
   * Data encryption / decryption module constructor.
   */
  static CryptoModule: typeof CryptoModuleType | undefined =
    process.env.CRYPTO_MODULE !== 'disabled' ? WebCryptoModule : undefined;

  /**
   * PubNub File constructor.
   */
  public File: PubNubFileConstructor<PubNubFile, PubNubFileParameters> = PubNubFile;
  /**
   * Create and configure the PubNub client core.
   *
   * @param configuration - User-provided PubNub client configuration.
   *
   * @returns Configured and ready to use PubNub client.
   */
  constructor(configuration: PubNubConfiguration) {
    const sharedWorkerRequested = configuration.subscriptionWorkerUrl !== undefined;
    const configurationCopy = setDefaults(configuration);
    const platformConfiguration: PubNubConfiguration & ExtendedConfiguration & PlatformConfiguration = {
      ...configurationCopy,
      sdkFamily: 'Web',
    };

    if (process.env.FILE_SHARING_MODULE !== 'disabled') platformConfiguration.PubNubFile = PubNubFile;

    // Prepare full client configuration.
    const clientConfiguration = makeConfiguration(
      platformConfiguration,
      (cryptoConfiguration: CryptorConfiguration) => {
        if (!cryptoConfiguration.cipherKey) return undefined;

        if (process.env.CRYPTO_MODULE !== 'disabled') {
          const cryptoModule = new WebCryptoModule({
            default: new LegacyCryptor({
              ...cryptoConfiguration,
              ...(!cryptoConfiguration.logger ? { logger: clientConfiguration.logger() } : {}),
            }),
            cryptors: [new AesCbcCryptor({ cipherKey: cryptoConfiguration.cipherKey })],
          });

          return cryptoModule;
        } else return undefined;
      },
    );

    if (configuration.subscriptionWorkerLogVerbosity) configuration.subscriptionWorkerLogLevel = LogLevel.Debug;
    else if (configuration.subscriptionWorkerLogLevel === undefined)
      configuration.subscriptionWorkerLogLevel = LogLevel.None;

    if (configuration.subscriptionWorkerLogVerbosity !== undefined) {
      clientConfiguration
        .logger()
        .warn(
          'Configuration',
          "'subscriptionWorkerLogVerbosity' is deprecated. Use 'subscriptionWorkerLogLevel' instead.",
        );
    }

    if (process.env.CRYPTO_MODULE !== 'disabled') {
      // Ensure that the logger has been passed to the user-provided crypto module.
      if (clientConfiguration.getCryptoModule())
        (clientConfiguration.getCryptoModule() as WebCryptoModule).logger = clientConfiguration.logger();
    }

    // Prepare Token manager.
    let tokenManager: TokenManager | undefined;
    if (process.env.CRYPTO_MODULE !== 'disabled') {
      tokenManager = new TokenManager(
        new Cbor((arrayBuffer: ArrayBuffer) => stringifyBufferKeys(CborReader.decode(arrayBuffer)), decode),
      );
    }

    // Legacy crypto (legacy data encryption / decryption and request signature support).
    let crypto: Crypto | undefined;
    if (process.env.CRYPTO_MODULE !== 'disabled') {
      if (clientConfiguration.getCipherKey() || clientConfiguration.secretKey) {
        crypto = new Crypto({
          secretKey: clientConfiguration.secretKey,
          cipherKey: clientConfiguration.getCipherKey(),
          useRandomIVs: clientConfiguration.getUseRandomIVs(),
          customEncrypt: clientConfiguration.getCustomEncrypt(),
          customDecrypt: clientConfiguration.getCustomDecrypt(),
          logger: clientConfiguration.logger(),
        });
      }
    }

    // Settings change handlers
    let heartbeatIntervalChangeHandler: (interval: number) => void = () => {};
    let presenceStateChangeHandler: (state: Record<string, Payload>) => void = () => {};
    let authenticationChangeHandler: (auth?: string) => void = () => {};
    let userIdChangeHandler: (userId: string) => void = () => {};

    let cryptography: Cryptography<ArrayBuffer | string> | undefined;
    if (process.env.CRYPTO_MODULE !== 'disabled') cryptography = new WebCryptography();

    // Setup transport provider.
    let transport: Transport = new WebTransport(clientConfiguration.logger(), platformConfiguration.transport);

    if (process.env.SHARED_WORKER !== 'disabled') {
      if (configurationCopy.subscriptionWorkerUrl) {
        try {
          // Inject subscription worker into the transport provider stack.
          const middleware = new SubscriptionWorkerMiddleware({
            clientIdentifier: clientConfiguration._instanceId,
            subscriptionKey: clientConfiguration.subscribeKey,
            userId: clientConfiguration.getUserId(),
            workerUrl: configurationCopy.subscriptionWorkerUrl,
            sdkVersion: clientConfiguration.getVersion(),
            heartbeatInterval: clientConfiguration.getHeartbeatInterval(),
            announceSuccessfulHeartbeats: clientConfiguration.announceSuccessfulHeartbeats,
            announceFailedHeartbeats: clientConfiguration.announceFailedHeartbeats,
            workerOfflineClientsCheckInterval: platformConfiguration.subscriptionWorkerOfflineClientsCheckInterval!,
            workerUnsubscribeOfflineClients: platformConfiguration.subscriptionWorkerUnsubscribeOfflineClients!,
            workerLogLevel: platformConfiguration.subscriptionWorkerLogLevel!,
            tokenManager,
            transport,
            logger: clientConfiguration.logger(),
          });
          presenceStateChangeHandler = (state: Record<string, Payload>) => middleware.onPresenceStateChange(state);
          heartbeatIntervalChangeHandler = (interval: number) => middleware.onHeartbeatIntervalChange(interval);
          authenticationChangeHandler = (auth?: string) => middleware.onTokenChange(auth);
          userIdChangeHandler = (userId: string) => middleware.onUserIdChange(userId);
          transport = middleware;

          if (configurationCopy.subscriptionWorkerUnsubscribeOfflineClients) {
            window.addEventListener(
              'pagehide',
              (event) => {
                if (!event.persisted) middleware.terminate();
              },
              { once: true },
            );
          }
        } catch (e) {
          clientConfiguration.logger().error('PubNub', () => ({
            messageType: 'error',
            message: e,
          }));
        }
      } else if (sharedWorkerRequested) {
        clientConfiguration
          .logger()
          .warn('PubNub', 'SharedWorker not supported in this browser. Fallback to the original transport.');
      }
    }

    const transportMiddleware = new PubNubMiddleware({
      clientConfiguration,
      tokenManager,
      transport,
    });

    super({
      configuration: clientConfiguration,
      transport: transportMiddleware,
      cryptography,
      tokenManager,
      crypto,
    });

    this.onHeartbeatIntervalChange = heartbeatIntervalChangeHandler;
    this.onAuthenticationChange = authenticationChangeHandler;
    this.onPresenceStateChange = presenceStateChangeHandler;
    this.onUserIdChange = userIdChangeHandler;

    if (process.env.SHARED_WORKER !== 'disabled') {
      if (transport instanceof SubscriptionWorkerMiddleware) {
        transport.emitStatus = this.emitStatus.bind(this);
        const disconnect = this.disconnect.bind(this);

        this.disconnect = (isOffline: boolean) => {
          transport.disconnect();
          disconnect();
        };
      }
    }

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
    this.logger.debug('PubNub', 'Network down detected');

    this.emitStatus({ category: PubNub.CATEGORIES.PNNetworkDownCategory });

    if (this._configuration.restore) this.disconnect(true);
    else this.destroy(true);
  }

  private networkUpDetected() {
    this.logger.debug('PubNub', 'Network up detected');

    this.emitStatus({ category: PubNub.CATEGORIES.PNNetworkUpCategory });
    this.reconnect();
  }
}
