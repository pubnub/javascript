 /* @flow */

import PubNubCore from '../core/pubnub-common.js';
import packageJSON from '../../package.json';
import { InternalSetupStruct } from '../core/flow_interfaces';

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
    setup.params = {
      pnsdk: 'PubNub-JS-Nodejs/' + packageJSON.version
    };

    super(setup);
  }

}
