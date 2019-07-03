/* @flow */

import {
  UsersObjectInput,
  UsersResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

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
  return operationConstants.PNUpdateUserOperation;
}

export function validateParams(
  { config }: ModulesInject,
  incomingParams: UsersObjectInput
) {
  let { id, custom } = incomingParams;

  if (!id) return 'Missing User.id';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (custom) {
    if (
      !Object.values(custom).every(
        value =>
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean'
      )
    ) {
      return 'Invalid custom type, only string, number and boolean values are allowed.';
    }
  }
}

export function usePatch() {
  return true;
}

export function getURL(modules: ModulesInject): string {
  let { config } = modules;
  return `/v1/objects/${config.subscribeKey}/users`;
}

export function patchURL(modules: ModulesInject): string {
  const { config } = modules;
  return `/v1/objects/${config.subscribeKey}/users`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(
  modules: ModulesInject,
  incomingParams: UsersObjectInput
): Object {
  let { channelGroups = [] } = incomingParams;
  let params = {};

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  return params;
}

export function patchPayload(
  modules: ModulesInject,
  incomingParams: UsersObjectInput
): string {
  const { message } = incomingParams;
  return prepareMessagePayload(modules, message);
}

export function handleResponse(
  modules: ModulesInject,
  usersResponse: Object
): UsersResponse {
  return usersResponse;
}
