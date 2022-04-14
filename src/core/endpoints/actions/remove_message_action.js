/*       */

import { RemoveMessageActionInput, RemoveMessageActionResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNRemoveMessageActionOperation;
}

export function validateParams({ config }, incomingParams) {
  const { channel, actionTimetoken, messageTimetoken } = incomingParams;

  if (!messageTimetoken) return 'Missing message timetoken';
  if (!actionTimetoken) return 'Missing action timetoken';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!channel) return 'Missing message channel';
}

export function useDelete() {
  return true;
}

export function getURL({ config }, incomingParams) {
  const { channel, actionTimetoken, messageTimetoken } = incomingParams;

  return `/v1/message-actions/${config.subscribeKey}/channel/${utils.encodeString(
    channel,
  )}/message/${messageTimetoken}/action/${actionTimetoken}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams() {
  return {};
}

export function handleResponse(modules, removeMessageActionResponse) {
  return { data: removeMessageActionResponse.data };
}
