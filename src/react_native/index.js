/* @flow */

import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Database from '../db/common';
import { get, post } from '../networking/modules/react_native';
import { InternalSetupStruct } from '../core/flow_interfaces';

export default class extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    setup.db = new Database();
    setup.networking = new Networking({ get, post });
    setup.sdkFamily = 'ReactNative';
    setup.ssl = true;
    super(setup);
  }
}
