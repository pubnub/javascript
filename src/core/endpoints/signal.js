/*       */

import { SignalResponse, SignalArguments, ModulesInject } from '../flow_interfaces';
import operationConstants from '../constants/operations';
import utils from '../utils';

function prepareMessagePayload(modules, messagePayload) {
  const stringifiedPayload = JSON.stringify(messagePayload);

  return stringifiedPayload;
}

export function getOperation() {
  return operationConstants.PNSignalOperation;
}

export function validateParams({ config }, incomingParams) {
  const { message, channel } = incomingParams;

  if (!channel) return 'Missing Channel';
  if (!message) return 'Missing Message';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams) {
  const { config } = modules;
  const { channel, message } = incomingParams;
  const stringifiedPayload = prepareMessagePayload(modules, message);
  return `/signal/${config.publishKey}/${config.subscribeKey}/0/${utils.encodeString(channel)}/0/${utils.encodeString(
    stringifiedPayload,
  )}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams() {
  const params = {};

  return params;
}

export function handleResponse(modules, serverResponse) {
  return { timetoken: serverResponse[2] };
}
