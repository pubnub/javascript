/* @flow */

import CborReader from 'cbor-sync';
import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Database from '../db/common';
import Cbor from '../cbor/common';
import { del, get, post, patch } from '../networking/modules/web-node';
import { getfile, postfile } from '../networking/modules/react_native';
import { InternalSetupStruct } from '../core/flow_interfaces';

import WebCryptography from '../crypto/modules/web';
import PubNubFile from '../file/modules/react-native';

export default class extends PubNubCore {
  constructor(setup: InternalSetupStruct) {
    setup.db = new Database();
    setup.cbor = new Cbor(CborReader.decode, (base64String) => Buffer.from(base64String, 'base64'));

    setup.PubNubFile = PubNubFile;
    setup.cryptography = new WebCryptography();

    setup.networking = new Networking({ del, get, post, patch, getfile, postfile });
    setup.sdkFamily = 'ReactNative';
    setup.ssl = true;

    super(setup);
  }
}
