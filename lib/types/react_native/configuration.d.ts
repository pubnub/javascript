import { ExtendedConfiguration, UserConfiguration } from '../core/interfaces/configuration';
export type PubNubConfiguration = UserConfiguration;
export declare const setDefaults: (configuration: PubNubConfiguration) => PubNubConfiguration & ExtendedConfiguration;
