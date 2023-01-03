/*       */

import { GetMessageActionsInput, GetMessageActionsResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNGetMessageActionsOperation;
}

export function validateParams({ config }, incomingParams) {
  const { channel } = incomingParams;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!channel) return 'Missing message channel';
}

export function getURL({ config }, incomingParams) {
  const { channel } = incomingParams;

  return `/v1/message-actions/${config.subscribeKey}/channel/${utils.encodeString(channel)}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const { limit, start, end } = incomingParams;
  const outgoingParams = {};

  if (limit) outgoingParams.limit = limit;
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;

  return outgoingParams;
}

export function handleResponse(modules, getMessageActionsResponse) {
  /** @type GetMessageActionsResponse */
  const response = { data: getMessageActionsResponse.data, start: null, end: null };

  if (response.data.length) {
    response.end = response.data[response.data.length - 1].actionTimetoken;
    response.start = response.data[0].actionTimetoken;
  }

  return response;
}
