/* @flow */

import EventEmitter from 'event-emitter';

export default class {

  _channelStorage: Object;
  _channelGroupStorage: Object;

  // state storage for each channel:
  // key: channel / channel group
  // value: json object of data
  _presenceState: Object;

  // this number gets sent on all subscribe calls to indicate the starting Point
  // of information polling.
  _subscribeTimeToken: string;

  _eventEmitter: EventEmitter;

  constructor() {
    this._channelStorage = {};
    this._channelGroupStorage = {};
    this._presenceState = {};

    this._eventEmitter = new EventEmitter();
    this.__subscribeTimeToken = '0';
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

  removeChannel(key: string) {
    delete this._channelStorage[key];
  }

  addChannelGroup(name: string, metadata: Object) {
    this._channelGroupStorage[name] = metadata;
  }


  removeChannelGroup(key: string) {
    delete this._channelGroupStorage[key];
  }

  addToPresenceState(key: string, value: Object) {
    this._presenceState[key] = value;
  }

  getPresenceState(): Object {
    return this._presenceState;
  }

  setSubscribeTimeToken(newTimeToken: number) {
    this._subscribeTimeToken = newTimeToken;
  }

  getSubscribeTimeToken() {
    return this._subscribeTimeToken;
  }

  // event emitters

  onStateChange(callback: Function) {
    this._eventEmitter.on('onStateChange', callback);
  }

  onSubscriptionChange(callback: Function) {
    this._eventEmitter.on('onSubscriptionChange', callback);
  }

  announceStateChange() {
    this._eventEmitter.emit('onStateChange');
  }

  announceSubscriptionChange() {
    this.__subscribeTimeToken = 0;
    this._eventEmitter.emit('onSubscriptionChange');
  }

  // end event emitting.

  getSubscribedChannels() {
    return Object.keys(this._channelStorage);
  }

  getSubscribedChannelGroups() {
    return Object.keys(this._channelGroupStorage);
  }

}
