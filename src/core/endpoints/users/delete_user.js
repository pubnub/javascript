/* @flow */

import { UsersResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation(): string {
  return operationConstants.PNDeleteUserOperation;
}

export function validateParams({ config }: ModulesInject, userId: string) {
  if (!userId) return 'Missing UserId';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function useDelete() {
  return true;
}

export function getURL(modules: ModulesInject, userId: string): string {
  let { config } = modules;
  return `/v1/objects/${config.subscribeKey}/users/${utils.encodeString(userId)}`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(): Object {
  return {};
}

export function handleResponse(
  modules: ModulesInject,
  usersResponse: Object
): UsersResponse {
  return usersResponse;
}
