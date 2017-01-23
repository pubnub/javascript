/* @flow */

import { FetchHistoryArguments, HistoryResponse, HistoryItem, ModulesInject } from '../flow_interfaces';
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
  return operationConstants.PNHistoryOperation;
}

export function validateParams(modules: ModulesInject, incomingParams: FetchHistoryArguments) {
  let { channel } = incomingParams;
  let { config } = modules;

  if (!channel) return 'Missing channel';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: FetchHistoryArguments): string {
  let { channel } = incomingParams;
  let { config } = modules;
  return `/v2/history/sub-key/${config.subscribeKey}/channel/${utils.encodeString(channel)}`;
}

export function getRequestTimeout({ config }: ModulesInject): boolean {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return true;
}

export function prepareParams(modules: ModulesInject, incomingParams: FetchHistoryArguments): Object {
  const { start, end, reverse, count = 100, stringifiedTimeToken = false } = incomingParams;
  let outgoingParams: Object = {
    include_token: 'true'
  };

  outgoingParams.count = count;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';
  if (reverse != null) outgoingParams.reverse = reverse.toString();

  return outgoingParams;
}

export function handleResponse(modules: ModulesInject, serverResponse: FetchHistoryArguments): HistoryResponse {
  const response: HistoryResponse = {
    messages: [],
    startTimeToken: serverResponse[1],
    endTimeToken: serverResponse[2],
  };

  serverResponse[0].forEach((serverHistoryItem) => {
    const item: HistoryItem = {
      timetoken: serverHistoryItem.timetoken,
      entry: __processMessage(modules, serverHistoryItem.message)
    };

    response.messages.push(item);
  });

  return response;
}
