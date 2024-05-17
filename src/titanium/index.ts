import CborReader from 'cbor-sync';

import { makeConfiguration } from '../core/components/configuration';
import { TitaniumTransport } from '../transport/titanium-transport';
import { PubNubConfiguration, setDefaults } from './configuration';
import { TokenManager } from '../core/components/token_manager';
import { PubNubMiddleware } from '../transport/middleware';
import { PubNubCore } from '../core/pubnub-common';
import Cbor from '../cbor/common';

/**
 * PubNub client for Titanium.
 */
export class PubNub extends PubNubCore<null, null> {
  constructor(configuration: PubNubConfiguration) {
    const configurationCopy = setDefaults(configuration);
    const platformConfiguration = { ...configurationCopy, sdkFamily: 'TitaniumSDK' };

    // Prepare full client configuration.
    const clientConfiguration = makeConfiguration(platformConfiguration);

    // Prepare Token manager.

    let tokenManager: TokenManager | undefined;
    if (process.env.CRYPTO_MODULE !== 'disabled') {
      tokenManager = new TokenManager(
        new Cbor(CborReader.decode, (base64String: string) => Buffer.from(base64String, 'base64')),
      );
    }

    // Setup transport layer.
    const transportMiddleware = new PubNubMiddleware({
      clientConfiguration,
      tokenManager,
      transport: new TitaniumTransport(clientConfiguration.keepAlive, clientConfiguration.logVerbosity),
    });

    super({
      configuration: clientConfiguration,
      transport: transportMiddleware,
      tokenManager,
    });
  }
}

export { PubNub as default };
