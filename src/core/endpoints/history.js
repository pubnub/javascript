/* @flow */

import { FetchHistoryArguments, HistoryResponse, HistoryItem } from '../flow_interfaces';

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
  return 'PNHistoryOperation';
}

export function validateParams(modules, incomingParams: FetchHistoryArguments) {
  let { channel } = incomingParams;
  let { config } = modules;

  if (!channel) return 'Missing channel';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: FetchHistoryArguments): string {
  let { channel } = incomingParams;
  let { config } = modules;
  return '/v2/history/sub-key/' + config.subscribeKey + '/channel/' + encodeURIComponent(channel);
}

export function prepareParams(modules, incomingParams: FetchHistoryArguments): Object {
  const { start, end, includeTimetoken, reverse, count = 100 } = incomingParams;
  let outgoingParams = {};

  outgoingParams.count = count;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (includeTimetoken != null) outgoingParams.include_token = includeTimetoken.toString();
  if (reverse != null) outgoingParams.reverse = reverse.toString();

  return outgoingParams;
}

export function handleResponse(modules, serverResponse: FetchHistoryArguments): HistoryResponse {
  const response: HistoryResponse = {
    messages: [],
    startTimeToken: parseInt(serverResponse[1], 10),
    endTimeToken: parseInt(serverResponse[2], 10),
  };

  serverResponse[0].forEach((serverHistoryItem) => {
    const item: HistoryItem = {
      timetoken: null,
      entry: null
    };

    if (serverHistoryItem.timetoken) {
      item.timetoken = serverHistoryItem.timetoken;
      item.entry = __processMessage(modules, serverHistoryItem.message);
    } else {
      item.entry = __processMessage(modules, serverHistoryItem);
    }

    response.messages.push(item);
  });

  return response;
}
