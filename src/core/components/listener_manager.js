/* @flow */
import { MessageAnnouncement, StatusAnnouncement, CallbackStruct, PresenceAnnouncement } from '../flow_interfaces';

export default class {

  _listeners: Array<CallbackStruct>;

  constructor() {
    this._listeners = [];
  }

  addListener(newListeners: CallbackStruct) {
    this._listeners.push(newListeners);
  }

  removeListener(deprecatedListeners: CallbackStruct) {
    const listenerPosition = this._listeners.indexOf(deprecatedListeners);
    if (listenerPosition > -1) this._listeners = this._listeners.splice(listenerPosition, 1);
  }

  announcePresence(announce: PresenceAnnouncement) {
    this._listeners.forEach((listener) => {
      if (listener.presence) listener.presence(announce);
    });
  }

  announceStatus(announce: StatusAnnouncement) {
    this._listeners.forEach((listener) => {
      if (listener.status) listener.status(announce);
    });
  }

  announceMessage(announce: MessageAnnouncement) {
    this._listeners.forEach((listener) => {
      if (listener.message) listener.message(announce);
    });
  }

}
