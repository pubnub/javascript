import { TextEncoder, TextDecoder } from 'text-encoding';
import 'react-native-url-polyfill/auto';
import CborReader from 'cbor-js';
import { Buffer } from 'buffer';

import { ExtendedConfiguration, PlatformConfiguration } from '../core/interfaces/configuration';
import { WebReactNativeTransport } from '../transport/web-react-native-transport';
import { stringifyBufferKeys } from '../core/components/stringify_buffer_keys';
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

// Polyfill global environment
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;
global.Buffer = global.Buffer || Buffer;

/**
 * PubNub client for React Native platform.
 */
export default class PubNub extends PubNubCore<null, PubNubFileParameters> {
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
        });
      }
    }

    // Setup transport layer.
    const transportMiddleware = new PubNubMiddleware({
      clientConfiguration,
      tokenManager,
      transport: new WebReactNativeTransport(clientConfiguration.keepAlive, clientConfiguration.logVerbosity!),
    });

    super({
      configuration: clientConfiguration,
      transport: transportMiddleware,
      tokenManager,
      crypto,
    });
  }
}
