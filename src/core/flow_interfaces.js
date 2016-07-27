/* eslint no-unused-vars: 0 */
declare module 'uuid' {
  declare function v4(): string;
}

declare module 'superagent' {
  declare function type(): superagent;
}

export type CallbackStruct = {
  status: Function,
  presence: Function,
  message: Function
}

export type ProxyStruct = {
  port: number,
  hostname: string,
  headers: Object
}

export type InternalSetupStruct = {
  useSendBeacon: ?boolean, // configuration on beacon usage
  publishKey: ?string, // API key required for publishing
  subscribeKey: string, // API key required to subscribe
  cipherKey: string, // decryption keys
  origin: ?string, // an optional FQDN which will recieve calls from the SDK.
  ssl: boolean, // is SSL enabled?
  shutdown: Function, // function to call when pubnub is shutting down.

  sendBeacon: ?Function, // executes a call against the Beacon API
  useSendBeacon: ?boolean, // enable, disable usage of send beacons

  subscribeRequestTimeout: ?number, // how long to wait for subscribe requst
  transactionalRequestTimeout: ?number, // how long to wait for transactional requests

  proxy: ?ProxyStruct, // configuration to support proxy settings.

  suppressLev: ?boolean,

  db: Function // get / set implementation to store data

}

type DatabaseInterface = {
  get: Function,
  set: Function
}

type EndpointKeyDefinition = {
  required: boolean
}

type SupportedParams = {
  subscribeKey: EndpointKeyDefinition,
  uuid: EndpointKeyDefinition,
}

export type endpointDefinition = {
  params: SupportedParams,
  timeout: number,
  url: string
}

export type StateChangeAnnouncement = {
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

export type StatusAnnouncement = {
  error: boolean,
  statusCode: number,
  category: string,
  errorData: Object
}

// *****************************************************************************

// Time endpoints

type TimeResponse = {
  timetoken: number
};

// history

type FetchHistoryArguments = {
  channel: string, // fetch history from a channel
  channelGroup: string, // fetch history from channel groups
  start: number, // start timetoken for history fetching
  end: number, // end timetoken for history feting
  includeTimetoken: boolean, // include time token for each history call
  reverse: boolean,
  count: number
}

type HistoryItem = {
  timetoken: number | null,
  entry: any,
}

type HistoryResponse = {
  messages: Array<HistoryItem>,
  startTimeToken: number,
  endTimeToken: number,
}

// CG endpoints

type AddChannelParams = {
  channels: Array<string>,
  channelGroup: string,
}

type RemoveChannelParams = {
  channels: Array<string>,
  channelGroup: string,
}

type DeleteGroupParams = {
  channelGroup: string,
}

type ListAllGroupsResponse = {
  groups: Array<string>
}

type ListChannelsParams = {
  channelGroup: string,
}

type ListChannelsResponse = {
  channels: Array<string>
}

//

// push

type ProvisionDeviceArgs = {
  operation: 'add' | 'remove',
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
  channels: Array<string>
};

type ModifyDeviceArgs = {
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
  channels: Array<string>
};

type ListChannelsArgs = {
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
};

type RemoveDeviceArgs = {
  pushGateway: 'gcm' | 'apns' | 'mpns',
  device: string,
};

type ListPushChannelsResponse = {
  channels: Array<string>
}

//

// presence

type LeaveArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
}

type HereNowArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  includeUUIDs: boolean,
  includeState: boolean
}

type WhereNowArguments = {
  uuid: string,
}

type WhereNowResponse = {
  channels: Array<string>,
}

//

type GetStateArguments = {
  uuid: string,
  channels: Array<string>,
  channelGroups: Array<string>
}

type GetStateResponse = {
  channels: Object
}

//

type SetStateArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  state: Object
}

type SetStateResponse = {
  state: Object
}


type HeartbeatArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  state: Object
}

//

// subscribe

type SubscribeArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  timetoken: number,
  filterExpression: ?string,
  region: ?string,
}

//

// access manager

type AuditArguments = {
  channel: string,
  channelGroup: string,
  authKeys: Array<string>,
}

type GrantArguments = {
  channels: Array<string>,
  channelGroups: Array<string>,
  ttl: number,
  read: boolean,
  write: boolean,
  manage: boolean,
  authKeys: Array<string>
}

// publish

type PublishResponse = {
  timetoken: number
};

type PublishArguments = {
  message: Object | string | number | boolean, // the contents of the dispatch
  channel: string, // the destination of our dispatch
  sendByPost: boolean | null, // use POST when dispatching the message
  storeInHistory: boolean | null, // store the published message in remote history
  meta: Object, // psv2 supports filtering by metadata
  replicate: boolean | null // indicates to server on replication status to other data centers.
}

//

type ModulesInject = {
  config: Object;
}

module.exports = {};
