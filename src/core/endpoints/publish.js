/*       */

import { PublishResponse, PublishArguments, ModulesInject } from '../flow_interfaces';
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

export function getOperation() {
  return operationConstants.PNPublishOperation;
}

export function validateParams({ config }, incomingParams) {
  const { message, channel } = incomingParams;

  if (!channel) return 'Missing Channel';
  if (!message) return 'Missing Message';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function usePost(modules, incomingParams) {
  const { sendByPost = false } = incomingParams;
  return sendByPost;
}

export function getURL(modules, incomingParams) {
  const { config } = modules;
  const { channel, message } = incomingParams;
  const stringifiedPayload = prepareMessagePayload(modules, message);
  return `/publish/${config.publishKey}/${config.subscribeKey}/0/${utils.encodeString(channel)}/0/${utils.encodeString(
    stringifiedPayload,
  )}`;
}

export function postURL(modules, incomingParams) {
  const { config } = modules;
  const { channel } = incomingParams;
  return `/publish/${config.publishKey}/${config.subscribeKey}/0/${utils.encodeString(channel)}/0`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function postPayload(modules, incomingParams) {
  const { message } = incomingParams;
  return prepareMessagePayload(modules, message);
}

export function prepareParams(modules, incomingParams) {
  const { meta, replicate = true, storeInHistory, ttl } = incomingParams;
  const params = {};

  if (storeInHistory != null) {
    if (storeInHistory) {
      params.store = '1';
    } else {
      params.store = '0';
    }
  }

  if (ttl) {
    params.ttl = ttl;
  }

  if (replicate === false) {
    params.norep = 'true';
  }

  if (meta && typeof meta === 'object') {
    params.meta = JSON.stringify(meta);
  }

  return params;
}

export function handleResponse(modules, serverResponse) {
  return { timetoken: serverResponse[2] };
}
