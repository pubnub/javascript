 /* @flow */

import superagent from 'superagent';
import superagentProxy from 'superagent-proxy';

import PubNubCore from '../core/pubnub-common';
import { InternalSetupStruct } from '../core/flow_interfaces';

superagentProxy(superagent);

let Database = class {

  storage: Object;

  constructor() {
    this.storage = {};
  }

  get(key) {
    return this.storage[key];
  }

  set(key, value) {
    this.storage[key] = value;
  }
};

export default class extends PubNubCore {

  constructor(setup: InternalSetupStruct) {
    setup.db = new Database();
    setup.sdkFamily = 'Nodejs';
    super(setup);
  }

}
