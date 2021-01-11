/* @flow */

import {
  FetchMessagesArguments,
  FetchMessagesResponse,
  MessageAnnouncement,
  HistoryV3Response,
  ModulesInject,
} from '../flow_interfaces';
import operationConstants from '../constants/operations';
import utils from '../utils';

function __processMessage(modules, message: Object): Object | null {
  let { config, crypto } = modules;
  if (!config.cipherKey) return message;

  try {
    return crypto.decrypt(message);
  } catch (e) {
    return message;
  }
}

export function getOperation(): string {
  return operationConstants.PNFetchMessagesOperation;
}

export function validateParams(
  modules: ModulesInject,
  incomingParams: FetchMessagesArguments
) {
  let { channels, includeMessageActions = false } = incomingParams;
  let { config } = modules;

  if (!channels || channels.length === 0) return 'Missing channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (includeMessageActions && channels.length > 1) {
    throw new TypeError('History can return actions data for a single channel only. Either pass a single channel or disable the includeMessageActions flag.');
  }
}

export function getURL(
  modules: ModulesInject,
  incomingParams: FetchMessagesArguments
): string {
  let { channels = [], includeMessageActions = false } = incomingParams;
  let { config } = modules;
  const endpoint = !includeMessageActions ? 'history' : 'history-with-actions';

  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return `/v3/${endpoint}/sub-key/${
    config.subscribeKey
  }/channel/${utils.encodeString(stringifiedChannels)}`;
}

export function getRequestTimeout({ config }: ModulesInject): boolean {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return true;
}

export function prepareParams(
  modules: ModulesInject,
  incomingParams: FetchMessagesArguments
): Object {
  const {
    channels,
    start,
    end,
    includeMessageActions,
    count,
    stringifiedTimeToken = false,
    includeMeta = false,
    includeUuid,
    includeUUID = true,
    includeMessageType = true
  } = incomingParams;
  let outgoingParams: Object = {};

  if (count) {
    outgoingParams.max = count;
  } else {
    outgoingParams.max = (channels.length > 1 || includeMessageActions === true) ? 25 : 100;
  }
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';
  if (includeMeta) outgoingParams.include_meta = 'true';
  if (includeUUID && includeUuid !== false) outgoingParams.include_uuid = 'true';
  if (includeMessageType) outgoingParams.include_message_type = 'true';

  return outgoingParams;
}

export function handleResponse(
  modules: ModulesInject,
  serverResponse: HistoryV3Response
): FetchMessagesResponse {
  const response: FetchMessagesResponse = {
    channels: {},
  };

  Object.keys(serverResponse.channels || {}).forEach((channelName) => {
    response.channels[channelName] = [];

    (serverResponse.channels[channelName] || []).forEach((messageEnvelope) => {
      let announce: MessageAnnouncement = {};
      announce.channel = channelName;
      announce.timetoken = messageEnvelope.timetoken;
      announce.message = __processMessage(modules, messageEnvelope.message);
      announce.messageType = messageEnvelope.message_type;
      announce.uuid = messageEnvelope.uuid;

      if (messageEnvelope.actions) {
        announce.actions = messageEnvelope.actions;

        // This should be kept for few updates for existing clients consistency.
        announce.data = messageEnvelope.actions;
      }
      if (messageEnvelope.meta) {
        announce.meta = messageEnvelope.meta;
      }

      response.channels[channelName].push(announce);
    });
  });
  if (serverResponse.more) {
    response.more  = serverResponse.more;
  }

  return response;
}
