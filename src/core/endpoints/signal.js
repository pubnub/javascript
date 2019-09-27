/* @flow */

import {
  SignalResponse,
  SignalArguments,
  ModulesInject,
} from '../flow_interfaces';
import operationConstants from '../constants/operations';
import utils from '../utils';

function prepareMessagePayload(modules, messagePayload) {
  let stringifiedPayload = JSON.stringify(messagePayload);

  return stringifiedPayload;
}

export function getOperation(): string {
  return operationConstants.PNSignalOperation;
}

export function validateParams(
  { config }: ModulesInject,
  incomingParams: SignalArguments
) {
  let { message, channel } = incomingParams;

  if (!channel) return 'Missing Channel';
  if (!message) return 'Missing Message';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(
  modules: ModulesInject,
  incomingParams: SignalArguments
): string {
  const { config } = modules;
  const { channel, message } = incomingParams;
  let stringifiedPayload = prepareMessagePayload(modules, message);
  return `/signal/${config.publishKey}/${config.subscribeKey}/0/${utils.encodeString(channel)}/0/${utils.encodeString(stringifiedPayload)}`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(): Object {
  const params = {};

  return params;
}

export function handleResponse(
  modules: ModulesInject,
  serverResponse: Object
): SignalResponse {
  return { timetoken: serverResponse[2] };
}
