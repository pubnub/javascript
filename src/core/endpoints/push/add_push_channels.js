/* @flow */

import { ModifyDeviceArgs, ModulesInject } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNPushNotificationEnabledChannelsOperation';
}

export function validateParams(modules: ModulesInject, incomingParams: ModifyDeviceArgs) {
  let { device, pushGateway, channels } = incomingParams;
  let { config } = modules;

  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
  if (!channels || channels.length === 0) return 'Missing Channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: ModifyDeviceArgs): string {
  let { device } = incomingParams;
  let { config } = modules;
  return '/v1/push/sub-key/' + config.subscribeKey + '/devices/' + device;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules: ModulesInject, incomingParams: ModifyDeviceArgs): Object {
  let { pushGateway, channels = [] } = incomingParams;
  return { type: pushGateway, add: channels.join(',') };
}

export function handleResponse(): Object {
  return {};
}
