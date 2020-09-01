/* @flow */

import CborReader from 'cbor-sync';
import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Database from '../db/common';
import Cbor from '../cbor/common';
import { del, get, patch, post, getfile, postfile } from '../networking/modules/web-node';
import { keepAlive, proxy } from '../networking/modules/node';
import { InternalSetupStruct } from '../core/flow_interfaces';

import NodeCryptography from '../crypto/modules/node';
import PubNubFile from '../file/modules/node';

export default class extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    setup.db = new Database();
    setup.cbor = new Cbor(CborReader.decode, (base64String) => Buffer.from(base64String, 'base64'));
    setup.networking = new Networking({ keepAlive, del, get, post, patch, proxy, getfile, postfile });
    setup.sdkFamily = 'Nodejs';

    setup.PubNubFile = PubNubFile;
    setup.cryptography = new NodeCryptography();

    if (!('ssl' in setup)) {
      setup.ssl = true;
    }

    super(setup);
  }
}
