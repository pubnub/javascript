/* @flow */

import { ListChannelsArgs, ListChannelsResponse } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNPushNotificationEnabledChannelsOperation';
}

export function validateParams(modules, incomingParams: ListChannelsArgs) {
  let { device, pushGateway } = incomingParams;
  let { config } = modules;

  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: ListChannelsArgs): string {
  let { device } = incomingParams;
  let { config } = modules;
  return '/v1/push/sub-key/' + config.subscribeKey + '/devices/' + device;
}

export function prepareParams(modules, incomingParams: ListChannelsArgs): Object {
  let { pushGateway } = incomingParams;
  return { type: pushGateway };
}

export function handleResponse(modules, serverResponse: Array<string>): ListChannelsResponse {
  return { channels: serverResponse };
}
