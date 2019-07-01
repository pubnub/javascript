/* @flow */

import {
  SignalResponse,
  SignalArguments,
  ModulesInject,
} from '../flow_interfaces';
import operationConstants from '../constants/operations';
import utils from '../utils';

function prepareMessagePayload(modules, messagePayload) {
  const { crypto, config } = modules;
  let stringifiedPayload = JSON.stringify(messagePayload);

  if (config.cipherKey) {
    stringifiedPayload = crypto.encrypt(stringifiedPayload);
    stringifiedPayload = JSON.stringify(stringifiedPayload);
  }

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

export function usePost() {
  return true;
}

export function postURL(
  modules: ModulesInject,
  incomingParams: SignalArguments
): string {
  const { config } = modules;
  const { channel } = incomingParams;
  return `/v1/signal/${config.publishKey}/${
    config.subscribeKey
  }/${utils.encodeString(channel)}`;
}

export function getURL(
  modules: ModulesInject,
  incomingParams: SignalArguments
): string {
  return postURL(modules, incomingParams);
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function postPayload(
  modules: ModulesInject,
  incomingParams: SignalArguments
): string {
  const { message } = incomingParams;
  return prepareMessagePayload(modules, message);
}

export function prepareParams(
  modules: ModulesInject,
  incomingParams: SignalArguments
): Object {
  const { meta } = incomingParams;
  const params = {};

  if (meta && typeof meta === 'object') {
    params.meta = JSON.stringify(meta);
  }

  return params;
}

export function handleResponse(
  modules: ModulesInject,
  serverResponse: Object
): SignalResponse {
  return { timetoken: serverResponse[2] };
}
