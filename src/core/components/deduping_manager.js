/* @flow */

import Config from '../components/config';
import { SubscribeMessage } from '../flow_interfaces';

type DedupingManagerConsturct = {
  config: Config,
}

const hashCode = (payload) => {
  let hash = 0;
  if (payload.length === 0) return hash;
  for (let i = 0; i < payload.length; i += 1) {
    let character = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + character; // eslint-disable-line
    hash = hash & hash; // eslint-disable-line
  }
  return hash;
};

export default class {

  _config: Config;
  hashHistory: Array<string>;

  constructor({ config }: DedupingManagerConsturct) {
    this.hashHistory = [];
    this._config = config;
  }

  getKey(message: SubscribeMessage) {
    const hashedPayload = hashCode(JSON.stringify(message.payload)).toString();
    const timetoken = message.publishMetaData.publishTimetoken;
    return `${timetoken}-${hashedPayload}`;
  }

  isDuplicate(message: SubscribeMessage) {
    return this.hashHistory.includes(this.getKey(message));
  }

  addEntry(message: SubscribeMessage) {
    if (this.hashHistory.length >= this._config.maximumCacheSize) {
      this.hashHistory.shift();
    }

    this.hashHistory.push(this.getKey(message));
  }

  clearHistory() {
    this.hashHistory = [];
  }

}
