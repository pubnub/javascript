/* @flow */

export default class {

  _channelStorage: Map<string, Object>;
  _channelGroupStorage: Map<string, Object>;

  constructor() {
    this._channelStorage = new Map();
    this._channelGroupStorage = new Map();
  }

  containsChannel(name: string): boolean {
    return this._channelStorage.has(name);
  }

  containsChannelGroup(name: string): boolean {
    return this._channelGroupStorage.has(name);
  }

  getChannel(name: string): Object | void {
    return this._channelStorage.get(name);
  }

  getChannelGroup(name: string): Object | void {
    return this._channelGroupStorage.get(name);
  }

  addChannel(name: string, metadata: Object) {
    this._channelStorage.set(name, metadata);
  }

  addChannelGroup(name: string, metadata: Object) {
    this._channelGroupStorage.set(name, metadata);
  }

  /**
   * Generate Subscription Channel List
   * ==================================
   * generate_channel_list(channels_object);
   * nopresence (==include-presence) == false --> presence True
   */
  generate_channel_list(nopresence: boolean): Array<string> {
    let list: Array<string> = [];
    this._channelStorage.forEach((status, channel) => {
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
  generate_channel_group_list(nopresence: boolean): Array<string> {
    let list: Array<string> = [];
    this._channelGroupStorage.forEach((status, channel_group) => {
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

}
