import CborReader from 'cbor-sync';
import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Cbor from '../cbor/common';
import { decode } from '../core/components/base64_codec';
import { del, get, patch, post, getfile, postfile } from '../networking/modules/web-node';
import { keepAlive, proxy } from '../networking/modules/node';

import NodeCryptography from '../crypto/modules/node';
import PubNubFile from '../file/modules/node';

export = class extends PubNubCore {
  constructor(setup: any) {
    setup.cbor = new Cbor((buffer: ArrayBuffer) => CborReader.decode(Buffer.from(buffer)), decode);
    setup.networking = new Networking({
      keepAlive,
      del,
      get,
      post,
      patch,
      proxy,
      getfile,
      postfile,
    });
    setup.sdkFamily = 'Nodejs';

    setup.PubNubFile = PubNubFile;
    setup.cryptography = new NodeCryptography();

    if (!('ssl' in setup)) {
      setup.ssl = true;
    }

    super(setup);
  }
};
