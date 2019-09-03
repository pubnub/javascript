/* @flow */

import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Database from '../db/common';
import Cbor from '../cbor/common';
import { del, get, post, patch } from '../networking/modules/titanium';
import { InternalSetupStruct } from '../core/flow_interfaces';

class PubNub extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    setup.db = new Database();
    setup.cbor = new Cbor();
    setup.sdkFamily = 'TitaniumSDK';
    setup.networking = new Networking({ del, get, post, patch });

    super(setup);
  }
}

export { PubNub as default };
