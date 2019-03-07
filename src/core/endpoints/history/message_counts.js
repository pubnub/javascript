/* @flow */

import operationConstants from '../../constants/operations';
import utils from '../../utils';
import type {
  MessageCounterArguments,
  MessageCountersResponse,
  ModulesInject
} from '../../flow_interfaces';


export function getOperation(): string {
  return operationConstants.PNMessageCounts;
}

export function validateParams(modules: ModulesInject, incomingParams: MessageCounterArguments) {
  let { channels, timetoken, channelTimetokens } = incomingParams;
  let { config } = modules;

  if (!channels) return 'Missing channel';
  if (timetoken && channelTimetokens) return 'timetoken and channelTimetokens are incompatible together';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: MessageCounterArguments): string {
  let { channels } = incomingParams;
  let { config } = modules;

  let stringifiedChannels = channels.join(',');

  return `/v3/history/sub-key/${config.subscribeKey}/message-counts/${utils.encodeString(stringifiedChannels)}`;
}

export function getRequestTimeout({ config }: ModulesInject): boolean {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return true;
}

export function prepareParams(modules: ModulesInject, incomingParams: MessageCounterArguments): Object {
  const { timetoken, channelTimetokens } = incomingParams;
  let outgoingParams: Object = {};

  if (timetoken) outgoingParams.timetoken = timetoken;
  if (channelTimetokens) outgoingParams.channelTimetokens = utils.encodeString(channelTimetokens.join(','));

  return outgoingParams;
}

export function handleResponse(modules: ModulesInject, serverResponse: MessageCounterArguments)
  : MessageCountersResponse {

  return { channels: serverResponse.channels };
}
