import {
  setDefaults as setBaseDefaults,
  ExtendedConfiguration,
  UserConfiguration,
} from '../core/interfaces/configuration';

/**
 * React Native platform PubNub client configuration.
 */
export type PubNubConfiguration = UserConfiguration & {
  /**
   * If passed, will encrypt the payloads.
   */
  cipherKey?: string;
};

/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 *
 * @internal
 */
export const setDefaults = (configuration: PubNubConfiguration): PubNubConfiguration & ExtendedConfiguration => {
  return setBaseDefaults(configuration);
};
