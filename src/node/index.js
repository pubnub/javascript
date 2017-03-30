 /* @flow */

import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Database from '../db/common';
import { get, post } from '../networking/modules/web-node';
import { keepAlive, proxy } from '../networking/modules/node';
import { InternalSetupStruct } from '../core/flow_interfaces';

export default class extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    setup.db = new Database();
    setup.networking = new Networking({ keepAlive, get, post, proxy });
    setup.sdkFamily = 'Nodejs';
    super(setup);
  }
}
