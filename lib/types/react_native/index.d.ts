import 'react-native-url-polyfill/auto';
import { PubNubFileParameters } from '../file/modules/react-native';
import { PubNubConfiguration } from './configuration';
import { PubNubCore } from '../core/pubnub-common';
/**
 * PubNub client for React Native platform.
 */
export default class PubNub extends PubNubCore<null, PubNubFileParameters> {
    /**
     * Create and configure PubNub client core.
     *
     * @param configuration - User-provided PubNub client configuration.
     *
     * @returns Configured and ready to use PubNub client.
     */
    constructor(configuration: PubNubConfiguration);
}
