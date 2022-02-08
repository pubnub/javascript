/** @flow */

export type HandshakeParams = {|
  channels?: string[],
  channelGroups?: string[]
|};

export type HandshakeResult = {|
  timetoken: string,
  region: number
|};

export type ReceiveMessagesParams = {|
  channels?: string[],
  channelGroups?: string[],
  timetoken: number,
  region: number,
  abortSignal: Object,
|};

export type Metadata = {|
  timetoken: number,
  region: number
|};
export type Message = {|
  shard: number,
  subscriptionMatch: string,
  channel: string,
  messageType: number,
  payload: Object,
  flags: number,
  issuingClientId: string,
  subscribeKey: string,
  originationTimetoken: string,
  publishMetaData: Metadata,
|}

export type ReceiveMessagesResult = {|
  messages? : Message[],
  metadata: Metadata
|};
