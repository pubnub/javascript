/**
 * Node.js specific {@link PubNub} client configuration module.
 */

import {
  UserConfiguration,
  ExtendedConfiguration,
  setDefaults as setBaseDefaults,
} from '../core/interfaces/configuration';
import { TransportKeepAlive } from '../core/interfaces/transport';
import { Payload } from '../core/types/api';
import { CryptoModule } from '../core/interfaces/crypto-module';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------

// region Defaults
/**
 * Whether PubNub client should try utilize existing TCP connection for new requests or not.
 */
const KEEP_ALIVE = false;
// endregion

/**
 * NodeJS platform PubNub client configuration.
 */
export type PubNubConfiguration = UserConfiguration & {
  /**
   * Set a custom parameters for setting your connection `keepAlive` if this is set to `true`.
   */
  keepAliveSettings?: TransportKeepAlive;

  /**
   * The cryptography module used for encryption and decryption of messages and files. Takes the
   * {@link cipherKey} and {@link useRandomIVs} parameters as arguments.
   *
   * For more information, refer to the
   * {@link /docs/sdks/javascript/api-reference/configuration#cryptomodule|cryptoModule} section.
   *
   * @default `not set`
   */
  cryptoModule?: CryptoModule;

  // region Deprecated parameters
  /**
   * If passed, will encrypt the payloads.
   *
   * @deprecated Pass it to {@link cryptoModule} instead.
   */
  cipherKey?: string;

  /**
   * When `true` the initialization vector (IV) is random for all requests (not just for file
   * upload).
   * When `false` the IV is hard-coded for all requests except for file upload.
   *
   * @default `true`
   *
   * @deprecated Pass it to {@link cryptoModule} instead.
   */
  useRandomIVs?: boolean;

  /**
   * Custom data encryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data encryption.
   */
  customEncrypt?: (data: string | Payload) => string;

  /**
   * Custom data decryption method.
   *
   * @deprecated Instead use {@link cryptoModule} for data decryption.
   */
  customDecrypt?: (data: string) => string;
  // endregion
};

/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 *
 * @returns Extended {@link PubNub} client configuration object pre-filled with default values.
 *
 * @internal
 */
export const setDefaults = (configuration: PubNubConfiguration): PubNubConfiguration & ExtendedConfiguration => {
  return {
    // Set base configuration defaults.
    ...setBaseDefaults(configuration),
    // Set platform-specific options.
    keepAlive: configuration.keepAlive ?? KEEP_ALIVE,
  };
};
