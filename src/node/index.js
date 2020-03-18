/* @flow */

import CborReader from 'cbor-sync';
import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Database from '../db/common';
import Cbor from '../cbor/common';
import { del, get, patch, post } from '../networking/modules/web-node';
import { keepAlive, proxy } from '../networking/modules/node';
import { InternalSetupStruct } from '../core/flow_interfaces';

export default class extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    setup.db = new Database();
    setup.cbor = new Cbor(CborReader.decode, (base64String) => new Buffer.from(base64String, 'base64'));
    setup.networking = new Networking({ keepAlive, del, get, post, patch, proxy });
    setup.sdkFamily = 'Nodejs';

    if (!('ssl' in setup)) {
      setup.ssl = true;
    }

    super(setup);
  }
}
