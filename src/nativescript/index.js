/* @flow */

import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Database from '../db/common';
import { get, post } from '../networking/modules/nativescript';
import { InternalSetupStruct } from '../core/flow_interfaces';

export default class extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    setup.db = new Database();
    setup.networking = new Networking({ get, post });
    setup.sdkFamily = 'NativeScript';
    setup.ssl = true;
    super(setup);
  }
}
