/* @flow */

import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Database from '../db/common';
import { del, get, patch, post } from '../networking/modules/web-node';
import { keepAlive, proxy } from '../networking/modules/node';
import { InternalSetupStruct } from '../core/flow_interfaces';

export default class extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    setup.db = new Database();
    setup.networking = new Networking({
      keepAlive,
      del,
      get,
      patch,
      post,
      proxy,
    });
    setup.sdkFamily = 'Nodejs';

    if (!('ssl' in setup)) {
      setup.ssl = true;
    }

    super(setup);
  }
}
