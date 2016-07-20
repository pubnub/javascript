/* @flow */

import { ModifyDeviceArgs } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNPushNotificationEnabledChannelsOperation';
}

export function validateParams(modules, incomingParams: ModifyDeviceArgs) {
  let { device, pushGateway, channels } = incomingParams;
  let { config } = modules;

  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
  if (!channels || channels.length === 0) return 'Missing Channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: ModifyDeviceArgs): string {
  let { device } = incomingParams;
  let { config } = modules;
  return '/v1/push/sub-key/' + config.subscribeKey + '/devices/' + device;
}

export function prepareParams(modules, incomingParams: ModifyDeviceArgs): Object {
  let { pushGateway, channels = [] } = incomingParams;
  return { type: pushGateway, remove: encodeURIComponent(channels.join(',')) };
}

export function handleResponse(): Object {
  return {};
}
