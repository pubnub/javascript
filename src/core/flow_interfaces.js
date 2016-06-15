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
  status: Function,
  presence: Function,
  message: Function
}

export type proxyStruct = {
  port: number,
  hostname: string,
  headers: Object
}

export type statusStruct = {
  error: boolean
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

  proxy: ?proxyStruct, // configuration to support proxy settings.

  suppressLev: ?boolean,

  db: Function // get / set implementation to store data

}

type DatabaseInterface = {
  get: Function,
  set: Function
}

type endpointKeyDefinition = {
  required: boolean
}

type supportedParams = {
  subscribeKey: endpointKeyDefinition,
  uuid: endpointKeyDefinition,
}

export type endpointDefinition = {
  params: supportedParams,
  timeout: number,
  url: string
}

export type stateChangeAnnouncement = {
  state: Object,
  channels: Array<string>,
  channelGroups: Array<string>
}

// ****************** SUBSCRIPTIONS ********************************************

type SubscribeMetadata = {
  timetoken: number,
  region: number
}

type PublishMetaData = {
  publishTimetoken: number,
  region: number
}

type SubscribeMessage = {
  shard: string,
  subscriptionMatch: string,
  channel: string,
  payload: Object,
  flags: string,
  issuingClientId: string,
  subscribeKey: string,
  originationTimetoken: string,
  publishMetaData: PublishMetaData

}

// subscribe responses
type SubscribeEnvelope = {
  messages: Array<SubscribeMessage>,
  metadata: SubscribeMetadata;
}

// *****************************************************************************


// ****************** Announcements ********************************************

type PresenceAnnouncement = {
  event: string,

  uuid: string,
  timestamp: number,
  occupancy: number,
  state: Object,

  subscribedChannel: string,
  actualChannel: string,
  timetoken: number,
  userMetadata: Object
}

type MessageAnnouncement = {

  message: Object,

  subscribedChannel: string,
  actualChannel: string,
  timetoken: number,
  userMetadata: Object
}
