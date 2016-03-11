/* @flow */

import utils from '../utils';

export default class {

  _channelStorage: Object;
  _channelGroupStorage: Object;

  _presenceState: Object;

  /*
    a relic mutex to keep track if the client is ready
  */
  _ready: boolean;

  constructor() {
    this._channelStorage = {};
    this._channelGroupStorage = {};
    this._presenceState = {};
  }

  containsChannel(name: string): boolean {
    return name in this._channelStorage;
  }

  containsChannelGroup(name: string): boolean {
    return name in this._channelGroupStorage;
  }

  getChannel(name: string): Object {
    return this._channelStorage[name];
  }

  getChannelGroup(name: string): Object {
    return this._channelGroupStorage[name];
  }

  addChannel(name: string, metadata: Object) {
    this._channelStorage[name] = metadata;
  }

  addChannelGroup(name: string, metadata: Object) {
    this._channelGroupStorage[name] = metadata;
  }

  addToPresenceState(key: string, value: Object) {
    this._presenceState[key] = value;
  }

  isInPresenceState(key: string): boolean {
    return key in this._presenceState;
  }

  removeFromPresenceState(key: string) {
    delete this._presenceState[key];
  }

  getPresenceState(): Object {
    return this._presenceState;
  }

  setIsReady(readyValue: boolean) {
    this._ready = readyValue;
  }

  getIsReady(): boolean {
    return this._ready;
  }

  /**
   * Generate Subscription Channel List
   * ==================================
   * generate_channel_list(channels_object);
   * nopresence (==include-presence) == false --> presence True
   */
  getChannels(nopresence: boolean): Array<string> {
    let list: Array<string> = [];
    utils.each(this._channelStorage, function (channel, status) {
      if (nopresence) {
        if (channel.search('-pnpres') < 0) {
          if (status.subscribed) list.push(channel);
        }
      } else {
        if (status.subscribed) list.push(channel);
      }
    });
    return list.sort();
  }

  /**
   * Generate Subscription Channel Groups List
   * ==================================
   * generate_channel_group_list(channels_groups object);
   */
  getChannelGroups(nopresence: boolean): Array<string> {
    let list: Array<string> = [];
    utils.each(this._channelGroupStorage, function (channel_group, status) {
      if (nopresence) {
        if (channel_group.search('-pnpres') < 0) {
          if (status.subscribed) list.push(channel_group);
        }
      } else {
        if (status.subscribed) list.push(channel_group);
      }
    });
    return list.sort();
  }

  each_channel_group(callback: Function) {
    var count = 0;

    utils.each(this.getChannelGroups(), function (channel_group) {
      var chang = this.getChannelGroup(channel_group);

      if (!chang) return;

      count++;
      (callback || function () {
      })(chang);
    });

    return count;
  }

  each_channel(callback: Function) {
    var count = 0;

    utils.each(this.getChannels(), function (channel) {
      var chan = this.getChannel(channel);

      if (!chan) return;

      count++;
      (callback || function () {
      })(chan);
    });

    return count;
  }

}
