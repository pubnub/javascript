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
  message: Function,
  signal: Function,
  messageAction: Function,
  user: Function,
  space: Function,
  membership: Function
}

export type ProxyStruct = {
  port: number,
  hostname: string,
  headers: Object
}

export type KeepAliveStruct = {
  keepAlive: number,
  keepAliveMsecs: number,
  freeSocketKeepAliveTimeout: number,
  timeout: number,
  maxSockets: number,
  maxFreeSockets: number
}

export type NetworkingModules = {
  keepAlive: ?Function,
  sendBeacon: ?Function,
  get: Function,
  post: Function,
  patch: Function
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

  keepAlive: ?boolean, // is keep-alive enabled?

  keepAliveSettings: ?KeepAliveStruct, // configuration on keep-alive usage

  suppressLev: ?boolean,

  networking: Function // component of networking to use
}

type EndpointKeyDefinition = {
  required: boolean
}

type SupportedParams = {
  subscribeKey: EndpointKeyDefinition,
  uuid: EndpointKeyDefinition,
}

export type EndpointDefinition = {
  params: SupportedParams,
  headers?: Object,
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
  messageType: number,
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

  subscribedChannel: string, // deprecated
  actualChannel: string,     // deprecated

  channel: string,
  subscription: string,

  timetoken: number,
  userMetadata: Object
}

type MessageAnnouncement = {

  message: Object,

  subscribedChannel: string, // deprecated
  actualChannel: string,     // deprecated

  channel: string,
  subscription: string,

  timetoken: number | string,
  userMetadata: Object,
  publisher: string
}

type SignalAnnouncement = {

  message: Object,

  channel: string,
  subscription: string,

  timetoken: number | string,
  userMetadata: Object,
  publisher: string
}

type ObjectMessage = {
  event: string,
  type: string,
  data: Object
}

type ObjectAnnouncement = {

  message: ObjectMessage,

  channel: string,
  subscription: string,

  timetoken: number | string,
  userMetadata: Object,
  publisher: string
}

export type StatusAnnouncement = {
  error: boolean,
  statusCode: number,
  category: string,
  errorData: Object,
  lastTimetoken: number,
  currentTimetoken: number,

  // send back channel, channel groups that were affected by this operation
  affectedChannels: Array<String>,
  affectedChannelGroups: Array<String>,
}

// *****************************************************************************

// Time endpoints

type TimeResponse = {
  timetoken: number
};

// history
type FetchHistoryArguments = {
  channel: string, // fetch history from a channel
  start: number | string, // start timetoken for history fetching
  end: number | string, // end timetoken for history fetching
  includeTimetoken: boolean, // include time token for each history call
  includeMeta: boolean, // include message meta for each history entry
  reverse: boolean,
  count: number
}

// history
export type MessageCounterArguments = {
  channels: Array<string>, // fetch history from a channel
  timetoken: number | null,
  channelTimetokens: Array<string> | null
}

type FetchMessagesArguments = {
  channels: string, // fetch history from a channel
  start: number | string, // start timetoken for history fetching
  end: number | string, // end timetoken for history fetching
  includeMeta: boolean, // include message meta for each history entry
  includeMessageActions: boolean, // include message actions for each history entry
  count: number
}

type HistoryItem = {
  timetoken: number | string | null,
  meta: Object | null,
  entry: any,
}

type HistoryResponse = {
  messages: Array<HistoryItem>,
  startTimeToken: number | string,
  endTimeToken: number | string,
}


export type MessageCountersResponse = {
  channels: Object
}

type HistoryV3Response = {
  channels: Object
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

export type APNS2Target = {
  topic: string,
  environment?: 'development' | 'production',
  excludedDevices?: Array<string>
}

export type APNS2Configuration = {
  collapseId?: string,
  expirationDate?: Date,
  targets: Array<APNS2Target>
}

type ProvisionDeviceArgs = {
  operation: 'add' | 'remove',
  pushGateway: 'gcm' | 'apns' | 'apns2' | 'mpns',
  environment?: 'development' | 'production',
  topic?: string,
  device: string,
  channels: Array<string>
};

type ModifyDeviceArgs = {
  pushGateway: 'gcm' | 'apns' | 'apns2' | 'mpns',
  environment?: 'development' | 'production',
  topic?: string,
  device: string,
  channels: Array<string>
};

type ListChannelsArgs = {
  pushGateway: 'gcm' | 'apns' | 'apns2' | 'mpns',
  environment?: 'development' | 'production',
  topic?: string,
  device: string,
};

type RemoveDeviceArgs = {
  pushGateway: 'gcm' | 'apns' | 'apns2' | 'mpns',
  environment?: 'development' | 'production',
  topic?: string,
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
  includeState: boolean,
  queryParameters?: Object
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
  state: Object
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
  uuids: Array<string>,
  ttl: number,
  read: boolean,
  write: boolean,
  manage: boolean,
  get: boolean,
  join: boolean,
  update: boolean,
  delete: Boolean,
  authKeys: Array<string>
}

// Base permissions object
interface GrantTokenObject {
  read: boolean,
  write: boolean,
  manage: boolean,
  delete: boolean,
  get: boolean,
  update: boolean,
  join: boolean
}

interface GrantTokenInput {
  ttl: number,
  authorizedUuid: String,
  resources?: {
    channels?: {
      [key: String]: GrantTokenObject,
    },
    groups?: {
      [key: String]: GrantTokenObject,
    },
    uuids?: {
      [key: String]: GrantTokenObject,
    }
  },
  patterns?: {
    channels?: {
      [key: String]: GrantTokenObject,
    },
    groups?: {
      [key: String]: GrantTokenObject,
    },
    uuids?: {
      [key: String]: GrantTokenObject,
    }
  },
  meta?: Object
}

interface GrantTokenOutput extends GrantTokenInput {
  version: number,
  timestamp: number,
  signature: Buffer
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

// signal
type SignalResponse = {
  timetoken: number
};

type SignalArguments = {
  message: Object | string | number | boolean,
  channel: string
}

// Actions

interface MessageAction {
  type: string,
  value: string,
}

interface PublishedMessageAction extends MessageAction {
  messageTimetoken: string,
  actionTimetoken: string,
  uuid: string,
}

type MessageActionAnnouncement = {
  data: PublishedMessageAction,
  event: string,

  channel: string,
  subscription: string,

  timetoken: number | string,
  userMetadata: Object,
  publisher: string
}

interface AddMessageActionInput {
  messageTimetoken: string,
  channel: string,
  action: MessageAction,
}

interface AddMessageActionResponse {
  data: PublishedMessageAction,
}

interface RemoveMessageActionInput {
  messageTimetoken: string,
  actionTimetoken: string,
  channel: string,
}

interface RemoveMessageActionResponse {
  data: {},
}

interface GetMessageActionsInput {
  channel: string,
  start?: number | string,
  end?: number | string,
  limit?: number,
}

interface GetMessageActionsResponse {
  data: Array<PublishedMessageAction>,
  start?: string,
  end?: string,
}

// Users Object

type UserListInput = {
  limit?: number,
  page?: {
    next?: string,
    prev?: string,
  },
  include?: {
    totalCount?: boolean,
    customFields?: boolean,
  },
  filter?: string,
}

type SingleUserInput = {
  userId: string,
  include?: {
    customFields?: boolean,
  }
}

type UsersObjectInput = {
  id: string,
  name: string,
  externalId?: string,
  profileUrl?: string,
  email?: string,
  custom?: Object,
};

type UserResponse = {
  status: number,
  data: {
    ...UsersObjectInput,
    created: string,
    updated: string,
    eTag: string,
  },
};

type UsersListResponse = {
  status: number,
  totalCount: number,
  next: String,
  prev: String,
  data: Array<UserResponse>,
};

// Spaces Object

type SpaceListInput = {
  limit?: number,
  page?: {
    next?: string,
    prev?: string,
  },
  include?: {
    totalCount?: boolean,
    customFields?: boolean,
  },
  filter?: string,
}

type SingleSpaceInput = {
  spaceId: string,
  include?: {
    customFields?: boolean,
  }
}

type SpacesObjectInput = {
  id: string,
  name: string,
  description?: String,
  custom?: Object,
  include?: {
    customFields?: boolean,
  }
};

type SpacesResponse = {
  status: number,
  data: {
    ...SpacesObjectInput,
    created: string,
    updated: string,
    eTag: string,
  },
};

type SpaceResponse = {
  status: number,
  data: {
    ...SpacesObjectInput,
    created: string,
    updated: string,
    eTag: string,
  },
};

type SpacesListResponse = {
  status: number,
  totalCount: number,
  next: String,
  prev: String,
  data: Array<SpaceResponse>,
};

// Memberships Object

type MembershipsInput = {
  userId: string,
  limit?: number,
  page?: {
    next?: string,
    prev?: string,
  },
  include?: {
    totalCount?: boolean,
    customFields?: boolean,
    spaceFields?: boolean,
    customSpaceFields?: boolean,
  },
  filter?: string,
}

type MembershipsObjectInput = {
  id: string,
  custom?: Object,
  space?: SpacesResponse,
};

type MembershipsResponse = {
  status: number,
  data: {
    ...MembershipsObjectInput,
    created: string,
    updated: string,
    eTag: string,
  },
};

type MembershipsListResponse = {
  status: number,
  totalCount: number,
  next: String,
  prev: String,
  data: Array<MembershipsResponse>,
};

interface AddMemberships extends MembershipsInput {
  addMemberships: Array<MembershipsObjectInput>,
}

interface UpdateMemberships extends MembershipsInput {
  updateMemberships: Array<MembershipsObjectInput>,
}

interface RemoveMemberships extends MembershipsInput {
  removeMemberships: Array<string>,
}

interface AddUpdateRemoveMemberships extends AddMemberships, UpdateMemberships, RemoveMemberships {}

// Members Object

type MembersInput = {
  spaceId: string,
  limit?: number,
  page?: {
    next?: string,
    prev?: string,
  },
  include?: {
    totalCount?: boolean,
    customFields?: boolean,
    userFields?: boolean,
    customUserFields?: boolean,
  },
  filter?: string,
}

type MembersObjectInput = {
  id: string,
  custom?: Object,
  user?: UserResponse,
};

type MembersResponse = {
  status: number,
  data: {
    ...MembersObjectInput,
    created: string,
    updated: string,
    eTag: string,
  },
};

type MembersListResponse = {
  status: number,
  totalCount: number,
  next: String,
  prev: String,
  data: Array<MembersResponse>,
};

interface AddMembers extends MembersInput {
  addMembers: Array<MembersObjectInput>,
}

interface UpdateMembers extends MembersInput {
  updateMembers: Array<MembersObjectInput>,
}

interface RemoveMembers extends MembersInput {
  removeMembers: Array<string>,
}

interface AddUpdateRemoveMembers extends AddMembers, UpdateMembers, RemoveMembers {}

//

type ModulesInject = {
  config: Object;
}

module.exports = {};
