/* eslint no-bitwise: ["error", { "allow": ["~", "&", ">>"] }] */
/* global navigator, window */

import CborReader from 'cbor-js';
import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import { decode } from '../core/components/base64_codec';
import { stringifyBufferKeys } from '../core/components/stringify_buffer_keys';
import Cbor from '../cbor/common';
import { del, get, post, patch, getfile, postfile } from '../networking/modules/web-node';

import WebCryptography from '../crypto/modules/web';
import PubNubFile from '../file/modules/web';

function sendBeacon(url) {
  if (navigator && navigator.sendBeacon) {
    navigator.sendBeacon(url);
  } else {
    return false;
  }
}

export default class extends PubNubCore {
  constructor(setup) {
    // extract config.
    const { listenToBrowserNetworkEvents = true } = setup;

    setup.sdkFamily = 'Web';
    setup.networking = new Networking({
      del,
      get,
      post,
      patch,
      sendBeacon,
      getfile,
      postfile,
    });
    setup.cbor = new Cbor((arrayBuffer) => stringifyBufferKeys(CborReader.decode(arrayBuffer)), decode);

    setup.PubNubFile = PubNubFile;
    setup.cryptography = new WebCryptography();

    super(setup);

    if (listenToBrowserNetworkEvents) {
      // mount network events.
      window.addEventListener('offline', () => {
        this.networkDownDetected();
      });

      window.addEventListener('online', () => {
        this.networkUpDetected();
      });
    }
  }
}
