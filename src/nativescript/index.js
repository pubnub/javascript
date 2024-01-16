/*       */

import PubNubCore from '../core/pubnub-common';
import Networking from '../networking';
import Database from '../db/common';
import { del, get, post, patch } from '../networking/modules/nativescript';

export default class extends PubNubCore {
  constructor(setup) {
    setup.db = new Database();
    setup.networking = new Networking({
      del,
      get,
      post,
      patch,
    });
    setup.sdkFamily = 'NativeScript';
    super(setup);
  }
}
