import { BaseConfiguration, PrivateConfigurationOptions } from '../core/interfaces/configuration';
import { TransportKeepAlive } from '../core/interfaces/transport';
import { CryptoModule } from '../crypto/modules/NodeCryptoModule/nodeCryptoModule';
import { FileConstructor } from '../core/interfaces/file';

export type PrivateNodeConfigurationOptions = PrivateConfigurationOptions;

/**
 * NodeJS platform PubNub client configuration.
 */
export interface NodeConfiguration extends BaseConfiguration {
  platform: 'node';

  /**
   * If set to `true`, SDK will use the same TCP connection for each HTTP request, instead of
   * opening a new one for each new request.
   *
   * @default `false`
   */
  keepAlive?: boolean;

  /**
   * Set a custom parameters for setting your connection `keepAlive` if this is set to `true`.
   */
  keepAliveSettings?: TransportKeepAlive;

  /**
   * The cryptography module used for encryption and decryption of messages and files. Takes the
   * `cipherKey` and `useRandomIVs` parameters as arguments.
   *
   * For more information, refer to the {@link /docs/sdks/javascript/api-reference/configuration#cryptomodule|cryptoModule} section.
   *
   * @default `not set`
   */
  cryptoModule?: CryptoModule;

  /**
   * If passed, will encrypt the payloads.
   *
   * @deprecated Pass it to `cryptoModule` instead.
   */
  cipherKey?: string;

  /**
   * When `true` the initialization vector (IV) is random for all requests (not just for file
   * upload).
   * When `false` the IV is hard-coded for all requests except for file upload.
   *
   * @default `true`
   * @deprecated Pass it to `cryptoModule` instead.
   */
  useRandomIVs?: boolean;
}
