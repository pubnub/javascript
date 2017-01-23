/* @flow */

import { RemoveDeviceArgs, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation(): string {
  return operationConstants.PNRemoveAllPushNotificationsOperation;
}

export function validateParams(modules: ModulesInject, incomingParams: RemoveDeviceArgs) {
  let { device, pushGateway } = incomingParams;
  let { config } = modules;

  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm or apns)';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: RemoveDeviceArgs): string {
  let { device } = incomingParams;
  let { config } = modules;
  return `/v1/push/sub-key/${config.subscribeKey}/devices/${device}/remove`;
}

export function getRequestTimeout({ config }: ModulesInject): number {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return true;
}

export function prepareParams(modules: ModulesInject, incomingParams: RemoveDeviceArgs): Object {
  let { pushGateway } = incomingParams;
  return { type: pushGateway };
}

export function handleResponse(): Object {
  return {};
}
