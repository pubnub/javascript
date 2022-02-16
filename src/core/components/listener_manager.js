/*       */
import {
  MessageAnnouncement,
  StatusAnnouncement,
  SignalAnnouncement,
  MessageActionAnnouncement,
  ObjectAnnouncement,
  CallbackStruct,
  PresenceAnnouncement,
  FileAnnouncement
} from '../flow_interfaces';
import categoryConstants from '../constants/categories';

export default class {
  _listeners                       ;

  constructor() {
    this._listeners = [];
  }

  addListener(newListeners                ) {
    this._listeners.push(newListeners);
  }

  removeListener(deprecatedListener                ) {
    let newListeners = [];

    this._listeners.forEach((listener) => {
      if (listener !== deprecatedListener) newListeners.push(listener);
    });

    this._listeners = newListeners;
  }

  removeAllListeners() {
    this._listeners = [];
  }

  announcePresence(announce                      ) {
    this._listeners.forEach((listener) => {
      if (listener.presence) listener.presence(announce);
    });
  }

  announceStatus(announce                    ) {
    this._listeners.forEach((listener) => {
      if (listener.status) listener.status(announce);
    });
  }

  announceMessage(announce                     ) {
    this._listeners.forEach((listener) => {
      if (listener.message) listener.message(announce);
    });
  }

  announceSignal(announce                    ) {
    this._listeners.forEach((listener) => {
      if (listener.signal) listener.signal(announce);
    });
  }

  announceMessageAction(announce                           ) {
    this._listeners.forEach((listener) => {
      if (listener.messageAction) listener.messageAction(announce);
    });
  }

  announceFile(announce                  ) {
    this._listeners.forEach((listener) => {
      if (listener.file) listener.file(announce);
    });
  }

  announceObjects(announce                    ) {
    this._listeners.forEach((listener) => {
      if (listener.objects) listener.objects(announce);
    });
  }

  announceUser(announce                    ) {
    this._listeners.forEach((listener) => {
      if (listener.user) listener.user(announce);
    });
  }

  announceSpace(announce                    ) {
    this._listeners.forEach((listener) => {
      if (listener.space) listener.space(announce);
    });
  }

  announceMembership(announce                    ) {
    this._listeners.forEach((listener) => {
      if (listener.membership) listener.membership(announce);
    });
  }

  announceNetworkUp() {
    let networkStatus                     = {};
    networkStatus.category = categoryConstants.PNNetworkUpCategory;
    this.announceStatus(networkStatus);
  }

  announceNetworkDown() {
    let networkStatus                     = {};
    networkStatus.category = categoryConstants.PNNetworkDownCategory;
    this.announceStatus(networkStatus);
  }
}
