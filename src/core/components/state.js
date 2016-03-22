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

  filterExpression: string; // V2 subscribe filter expression
  subscribeRegion: string; // V2 subscribe region selector


  constructor() {
    this._channelStorage = {};
    this._channelGroupStorage = {};
    this._presenceState = {};

    this._eventEmitter = new EventEmitter();
    this._subscribeTimeToken = '0';
    this.filterExpression = '';
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

  removeFromPresenceState(name: string) {
    delete this._presenceState[name];
  }

  isInPresenceState(name: string) {
    return name in this._presenceState;
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

  setSubscribeTimeToken(newTimeToken: string) {
    this._subscribeTimeToken = newTimeToken;
  }

  getSubscribeTimeToken(): string {
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
    this._subscribeTimeToken = '0';
    this._eventEmitter.emit('onSubscriptionChange');
  }

  // end event emitting.

  getSubscribedChannels(): Array<string> {
    return Object.keys(this._channelStorage);
  }

  getSubscribedChannelGroups(): Array<string> {
    return Object.keys(this._channelGroupStorage);
  }

}
