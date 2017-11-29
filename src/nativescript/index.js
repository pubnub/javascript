/* @flow */

import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Database from '../db/common';
import { del, get, post } from '../networking/modules/nativescript';
import { InternalSetupStruct } from '../core/flow_interfaces';

export default class extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    setup.db = new Database();
    setup.networking = new Networking({ del, get, post });
    setup.sdkFamily = 'NativeScript';
    super(setup);
  }
}
