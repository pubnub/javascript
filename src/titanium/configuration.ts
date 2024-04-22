import {
  setDefaults as setBaseDefaults,
  ExtendedConfiguration,
  UserConfiguration,
} from '../core/interfaces/configuration';

// --------------------------------------------------------
// ----------------------- Defaults -----------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether PubNub client should try to utilize existing TCP connection for new requests or not.
 */
const KEEP_ALIVE = true;
// endregion

/**
 * Titanium platform PubNub client configuration.
 */
export type PubNubConfiguration = UserConfiguration & {
  /**
   * If set to `true`, SDK will use the same TCP connection for each HTTP request, instead of
   * opening a new one for each new request.
   *
   * @default `true`
   */
  keepAlive?: boolean;
};

/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 */
export const setDefaults = (configuration: PubNubConfiguration): PubNubConfiguration & ExtendedConfiguration => {
  return {
    // Set base configuration defaults.
    ...setBaseDefaults(configuration),
    // Set platform-specific options.
    keepAlive: configuration.keepAlive ?? KEEP_ALIVE,
  };
};
