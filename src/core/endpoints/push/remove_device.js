/* @flow */

import { RemoveDeviceArgs } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNRemoveAllPushNotificationsOperation';
}

export function validateParams(modules, incomingParams: RemoveDeviceArgs) {
  let { device, pushGateway } = incomingParams;
  let { config } = modules;

  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: RemoveDeviceArgs): string {
  let { device } = incomingParams;
  let { config } = modules;
  return '/v1/push/sub-key/' + config.subscribeKey + '/devices/' + device + '/remove';
}

export function prepareParams(modules, incomingParams: RemoveDeviceArgs): Object {
  let { pushGateway } = incomingParams;
  return { type: pushGateway };
}

export function handleResponse(): Object {
  return {};
}
