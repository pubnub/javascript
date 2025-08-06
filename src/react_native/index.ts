import { TextEncoder, TextDecoder } from 'text-encoding';
import 'react-native-url-polyfill/auto';
import CborReader from 'cbor-js';
import { Buffer } from 'buffer';

import { ExtendedConfiguration, PlatformConfiguration } from '../core/interfaces/configuration';
import { stringifyBufferKeys } from '../core/components/stringify_buffer_keys';
import { ReactNativeTransport } from '../transport/react-native-transport';
import { makeConfiguration } from '../core/components/configuration';
import { PubNubFileParameters } from '../file/modules/react-native';
import { TokenManager } from '../core/components/token_manager';
import { PubNubMiddleware } from '../transport/middleware';
import { decode } from '../core/components/base64_codec';
import PubNubFile from '../file/modules/react-native';
import { PubNubConfiguration } from './configuration';
import Crypto from '../core/components/cryptography';
import { PubNubCore } from '../core/pubnub-common';
import { setDefaults } from './configuration';
import Cbor from '../cbor/common';

export type {
  LinearRetryPolicyConfiguration,
  ExponentialRetryPolicyConfiguration,
  RequestRetryPolicy,
  Endpoint,
} from '../core/components/retry-policy';
export type { PubNubConfiguration };

// Polyfill global environment
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;
global.Buffer = global.Buffer || Buffer;

/**
 * PubNub client for React Native platform.
 */
export default class PubNub extends PubNubCore<null, PubNubFileParameters> {
  /**
   * Exponential retry policy constructor.
   */
  static ExponentialRetryPolicy = PubNubCore.ExponentialRetryPolicy;

  /**
   * Linear retry policy constructor.
   */
  static LinearRetryPolicy = PubNubCore.LinearRetryPolicy;

  /**
   * Disabled / inactive retry policy.
   */
  static NoneRetryPolicy = PubNubCore.NoneRetryPolicy;

  /**
   * API call status category.
   */
  static CATEGORIES = PubNubCore.CATEGORIES;

  /**
   * Enum with API endpoint groups which can be used with retry policy to set up exclusions.
   */
  static Endpoint = PubNubCore.Endpoint;

  /**
   * Available minimum log levels.
   */
  static LogLevel = PubNubCore.LogLevel;

  /**
   * Type of REST API endpoint which reported status.
   */
  static OPERATIONS = PubNubCore.OPERATIONS;

  /**
   * Generate unique identifier.
   */
  static generateUUID = PubNubCore.generateUUID;

  /**
   * Construct notification payload which will trigger push notification.
   */
  static notificationPayload = PubNubCore.notificationPayload;
  /**
   * Create and configure PubNub client core.
   *
   * @param configuration - User-provided PubNub client configuration.
   *
   * @returns Configured and ready to use PubNub client.
   */
  constructor(configuration: PubNubConfiguration) {
    const configurationCopy = setDefaults(configuration);
    const platformConfiguration: ExtendedConfiguration & PlatformConfiguration = {
      ...configurationCopy,
      sdkFamily: 'ReactNative',
    };

    if (process.env.FILE_SHARING_MODULE !== 'disabled') platformConfiguration.PubNubFile = PubNubFile;

    // Prepare full client configuration.
    const clientConfiguration = makeConfiguration(platformConfiguration);

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

    // Setup transport layer.
    const transportMiddleware = new PubNubMiddleware({
      clientConfiguration,
      tokenManager,
      transport: new ReactNativeTransport(clientConfiguration.logger(), clientConfiguration.keepAlive),
    });

    super({
      configuration: clientConfiguration,
      transport: transportMiddleware,
      tokenManager,
      crypto,
    });
  }
}
