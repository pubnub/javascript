/* @flow */

import { SpacesResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation(): string {
  return operationConstants.PNDeleteSpaceOperation;
}

export function validateParams({ config }: ModulesInject, spaceId: string) {
  if (!spaceId) return 'Missing SpaceId';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function useDelete() {
  return true;
}

export function getURL(modules: ModulesInject, spaceId: string): string {
  let { config } = modules;
  return `/v1/objects/${config.subscribeKey}/spaces/${spaceId}`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function getAuthToken(modules: ModulesInject, spaceId: string): string {
  let token =
    modules.tokenManager.getToken('space', spaceId) ||
    modules.tokenManager.getToken('space');

  return token;
}

export function prepareParams(): Object {
  return {};
}

export function handleResponse(
  modules: ModulesInject,
  spacesResponse: Object
): SpacesResponse {
  return spacesResponse;
}
