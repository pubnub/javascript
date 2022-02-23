/*       */

import { RemoveDeviceArgs, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation() {
  return operationConstants.PNRemoveAllPushNotificationsOperation;
}

export function validateParams(modules, incomingParams) {
  const { device, pushGateway, topic } = incomingParams;
  const { config } = modules;

  if (!device) return 'Missing Device ID (device)';
  if (!pushGateway) return 'Missing GW Type (pushGateway: gcm, apns or apns2)';
  if (pushGateway === 'apns2' && !topic) return 'Missing APNS2 topic';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams) {
  const { device, pushGateway } = incomingParams;
  const { config } = modules;

  if (pushGateway === 'apns2') {
    return `/v2/push/sub-key/${config.subscribeKey}/devices-apns2/${device}/remove`;
  }

  return `/v1/push/sub-key/${config.subscribeKey}/devices/${device}/remove`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const { pushGateway, environment = 'development', topic } = incomingParams;
  let parameters = { type: pushGateway };

  if (pushGateway === 'apns2') {
    parameters = { ...parameters, environment, topic };
    delete parameters.type;
  }

  return parameters;
}

export function handleResponse() {
  return {};
}
