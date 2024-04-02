import CborReader from 'cbor-js';
import { Buffer } from 'buffer';

import { stringifyBufferKeys } from '../core/components/stringify_buffer_keys';
import { ReactNativeTransport } from '../transport/react-native-transport';
import { makeConfiguration } from '../core/components/configuration';
import { PubNubFileParameters } from '../file/modules/react-native';
import TokenManager from '../core/components/token_manager';
import { PubNubMiddleware } from '../transport/middleware';
import { decode } from '../core/components/base64_codec';
import PubNubFile from '../file/modules/react-native';
import { PubNubConfiguration } from './configuration';
import Crypto from '../core/components/cryptography';
import { PubNubCore } from '../core/pubnub-common';
import { setDefaults } from './configuration';
import Cbor from '../cbor/common';

global.Buffer = global.Buffer || Buffer;

/**
 * PubNub client for React Native platform.
 */
export default class PubNub extends PubNubCore<null, PubNubFileParameters> {
  constructor(configuration: PubNubConfiguration) {
    const configurationCopy = setDefaults(configuration);
    const platformConfiguration = { ...configurationCopy, sdkFamily: 'ReactNative', PubNubFile };

    // Prepare full client configuration.
    const clientConfiguration = makeConfiguration(platformConfiguration);

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

    // Setup transport layer.
    const transportMiddleware = new PubNubMiddleware({
      clientConfiguration,
      tokenManager,
      transport: new ReactNativeTransport(clientConfiguration.keepAlive, clientConfiguration.logVerbosity!),
    });

    super({
      configuration: clientConfiguration,
      transport: transportMiddleware,
      tokenManager,
      crypto,
    });
  }
}
