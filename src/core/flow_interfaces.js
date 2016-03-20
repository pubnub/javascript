/* eslint no-unused-vars: 0 */
declare module uuid {
  declare function v4(): string;
}

declare module 'lodash/defaults' {
  declare function exports(obj1: Object, obj2: Object): Object;
}

declare module 'lodash/each' {
  declare function exports(obj1: Object, func: Function): void;
}

declare module 'lodash/pick' {
  declare function exports(obj1: Object, pickableParams: Array<string>): Object;
}

export type callbackStruct = {
  onStatus: Function,
  onPresence: Function,
  onMessage: Function
}

export type internalSetupStruct = {
  useSendBeacon: ?boolean, // configuration on beacon usage
  publishKey: ?string, // API key required for publishing
  subscribeKey: string, // API key required to subscribe
  cipherKey: string, // decryption keys
  origin: ?string, // an optional FQDN which will recieve calls from the SDK.
  ssl: boolean, // is SSL enabled?
  shutdown: Function, // function to call when pubnub is shutting down.

  sendBeacon: ?Function, // executes a call against the Beacon API
  useSendBeacon: ?boolean, // enable, disable usage of send beacons

  navigatorOnlineCheck: Function, // a function which abstracts out navigator.onLine

  onStatus: Function, // function to call when a status shows up.
  onPresence: Function, // function to call when new presence data shows up
  onMessage: Function, // function to call when a new presence shows up

  subscribeRequestTimeout: ?number, // how long to wait for subscribe requst
  transactionalRequestTimeout: ?number, // how long to wait for transactional requests

  db: Function // get / set implementation to store data

}
