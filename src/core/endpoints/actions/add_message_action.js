/* @flow */

import {
  AddMessageActionInput,
  AddMessageActionResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';


export function getOperation(): string {
  return operationConstants.PNAddMessageActionOperation;
}

export function validateParams(
  { config }: ModulesInject,
  incomingParams: AddMessageActionInput
) {
  let { action, channel, messageTimetoken } = incomingParams;

  if (!messageTimetoken) return 'Missing message timetoken';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!channel) return 'Missing message channel';
  if (!action) return 'Missing Action';
  if (!action.value) return 'Missing Action.value';
  if (!action.type) return 'Missing Action.type';
  if (action.type.length > 15) return 'Action.type value exceed maximum length of 15';
}

export function usePost() {
  return true;
}

export function postURL(
  { config }: ModulesInject,
  incomingParams: AddMessageActionInput
): string {
  let { channel, messageTimetoken } = incomingParams;

  return `/v1/message-actions/${config.subscribeKey}/channel/${utils.encodeString(channel)}/message/${messageTimetoken}`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function getRequestHeaders(): Object {
  return { 'Content-Type': 'application/json' };
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(): Object {
  return {};
}

export function postPayload(
  modules: ModulesInject,
  incomingParams: AddMessageActionInput
): string {
  return incomingParams.action;
}

export function handleResponse(
  modules: ModulesInject,
  addMessageActionResponse: Object
): AddMessageActionResponse {
  return { data: addMessageActionResponse.data };
}
