import CborReader from 'cbor-sync';
import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Cbor from '../cbor/common';
import { del, get, post, patch } from '../networking/modules/titanium';

class PubNub extends PubNubCore {
  constructor(setup) {
    setup.cbor = new Cbor(CborReader.decode, (base64String) => Buffer.from(base64String, 'base64'));
    setup.sdkFamily = 'TitaniumSDK';
    setup.networking = new Networking({
      del,
      get,
      post,
      patch,
    });

    super(setup);
  }
}

export { PubNub as default };
