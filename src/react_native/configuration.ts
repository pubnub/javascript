import {
  UserConfiguration,
  ExtendedConfiguration,
  setDefaults as setBaseDefaults,
} from '../core/interfaces/configuration';

/**
 * React Native platform PubNub client configuration.
 */
export type PubNubConfiguration = UserConfiguration;

/**
 * Apply configuration default values.
 *
 * @param configuration - User-provided configuration.
 */
export const setDefaults = (configuration: PubNubConfiguration): PubNubConfiguration & ExtendedConfiguration => {
  return setBaseDefaults(configuration);
};
