/* @flow */

import { PublishResponse, PublishArguments } from '../flow_interfaces';

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
  return 'PNPublishOperation';
}

export function validateParams(modules, incomingParams: PublishArguments) {
  let { message, channel } = incomingParams;
  let { config } = modules;

  if (!channel) return 'Missing Channel';
  if (!message) return 'Missing Message';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function usePost(modules, incomingParams) {
  let { sendByPost = false } = incomingParams;
  return sendByPost;
}

export function getURL(modules, incomingParams: PublishArguments): string {
  const { config } = modules;
  const { channel, message } = incomingParams;
  let stringifiedPayload = prepareMessagePayload(modules, message);
  return '/publish/' + config.publishKey + '/' + config.subscribeKey + '/0/' + encodeURIComponent(channel) + '/0/' + encodeURIComponent(stringifiedPayload);
}

export function postURL(modules, incomingParams: PublishArguments): string {
  const { config } = modules;
  const { channel } = incomingParams;
  return '/publish/' + config.publishKey + '/' + config.subscribeKey + '/0/' + encodeURIComponent(channel) + '/0';
}

export function postPayload(modules, incomingParams: PublishArguments): string {
  const { message } = incomingParams;
  return prepareMessagePayload(modules, message);
}

export function prepareParams(modules, incomingParams: PublishArguments): Object {
  const { meta, replicate = true, storeInHistory } = incomingParams;
  const params = {};

  if (storeInHistory != null) {
    if (storeInHistory) {
      params.store = '1';
    } else {
      params.store = '0';
    }
  }

  if (replicate === false) {
    params.norep = 'true';
  }

  if (meta && typeof meta === 'object') {
    params.meta = JSON.stringify(meta);
  }

  return params;
}

export function handleResponse(modules, serverResponse: Object): PublishResponse {
  return { timetoken: serverResponse[2] };
}
