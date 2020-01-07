/* @flow */

import { RemoveDeviceArgs, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation(): string {
  return operationConstants.PNRemoveAllPushNotificationsOperation;
}

export function validateParams(modules: ModulesInject, incomingParams: RemoveDeviceArgs) {
  let { device, pushGateway, topic } = incomingParams;
  let { config } = modules;

  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
  if (pushGateway === 'apns2' && !topic) return 'Missing APNS2 topic';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: RemoveDeviceArgs): string {
  let { device, pushGateway } = incomingParams;
  let { config } = modules;

  if (pushGateway === 'apns2') {
    return `/v2/push/sub-key/${config.subscribeKey}/devices-apns2/${device}/remove`;
  }

  return `/v1/push/sub-key/${config.subscribeKey}/devices/${device}/remove`;
}

export function getRequestTimeout({ config }: ModulesInject): number {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return true;
}

export function prepareParams(modules: ModulesInject, incomingParams: RemoveDeviceArgs): Object {
  let { pushGateway, environment = 'development', topic } = incomingParams;
  let parameters = { type: pushGateway };

  if (pushGateway === 'apns2') {
    parameters = Object.assign({}, parameters, { environment, topic });
    delete parameters.type;
  }

  return parameters;
}

export function handleResponse(): Object {
  return {};
}
