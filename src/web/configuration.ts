import { BaseConfiguration, PrivateConfigurationOptions } from '../core/interfaces/configuration';
import { TransportKeepAlive } from '../core/interfaces/transport';
import { CryptoModule } from '../crypto/modules/WebCryptoModule/webCryptoModule';
import { FileConstructor } from '../core/interfaces/file';

export type PrivateWebConfigurationOptions = PrivateConfigurationOptions | 'PubNubFile';

/**
 * Browser platform PubNub client configuration.
 */
export interface WebConfiguration extends BaseConfiguration {
  platform: 'browser';

  /**
   * If the browser fails to detect the network changes from WiFi to LAN and vice versa or you
   * get reconnection issues, set the flag to `false`. This allows the SDK reconnection logic to
   * take over.
   *
   * @default `true`
   */
  listenToBrowserNetworkEvents?: boolean;

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

export type PubNubConfiguration = Exclude<WebConfiguration, 'platform'>;
