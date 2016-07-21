/* @flow */

import { ListChannelsArgs, ListChannelsResponse, ModulesInject } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNPushNotificationEnabledChannelsOperation';
}

export function validateParams(modules: ModulesInject, incomingParams: ListChannelsArgs) {
  let { device, pushGateway } = incomingParams;
  let { config } = modules;

  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: ListChannelsArgs): string {
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

export function prepareParams(modules: ModulesInject, incomingParams: ListChannelsArgs): Object {
  let { pushGateway } = incomingParams;
  return { type: pushGateway };
}

export function handleResponse(modules: ModulesInject, serverResponse: Array<string>): ListChannelsResponse {
  return { channels: serverResponse };
}
