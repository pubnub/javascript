/* @flow */

import { FetchMessagesArguments, FetchMessagesResponse, MessageAnnouncement, HistoryV3Response, ModulesInject } from '../flow_interfaces';
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

export function validateParams(modules: ModulesInject, incomingParams: FetchMessagesArguments) {
  let { channels } = incomingParams;
  let { config } = modules;

  if (!channels || channels.length === 0) return 'Missing channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: FetchMessagesArguments): string {
  let { channels = [] } = incomingParams;
  let { config } = modules;

  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return `/v3/history/sub-key/${config.subscribeKey}/channel/${utils.encodeString(stringifiedChannels)}`;
}

export function getRequestTimeout({ config }: ModulesInject): boolean {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return true;
}

export function prepareParams(modules: ModulesInject, incomingParams: FetchMessagesArguments): Object {
  const { start, end, count, stringifiedTimeToken = false } = incomingParams;
  let outgoingParams: Object = {};

  if (count) outgoingParams.max = count;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';

  return outgoingParams;
}

export function handleResponse(modules: ModulesInject, serverResponse: HistoryV3Response): FetchMessagesResponse {
  const response: FetchMessagesResponse = {
    channels: {}
  };

  Object.keys(serverResponse.channels || {}).forEach((channelName) => {
    response.channels[channelName] = [];

    (serverResponse.channels[channelName] || []).forEach((messageEnvelope) => {
      let announce: MessageAnnouncement = {};
      announce.channel = channelName;
      announce.subscription = null;
      announce.timetoken = messageEnvelope.timetoken;
      announce.message = __processMessage(modules, messageEnvelope.message);
      response.channels[channelName].push(announce);
    });
  });

  return response;
}
