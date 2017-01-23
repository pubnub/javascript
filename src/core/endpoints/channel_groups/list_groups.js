/* @flow */

import { ListAllGroupsResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation(): string {
  return operationConstants.PNChannelGroupsOperation;
}

export function validateParams(modules: ModulesInject) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject): string {
  let { config } = modules;
  return `/v1/channel-registration/sub-key/${config.subscribeKey}/channel-group`;
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

export function handleResponse(modules: ModulesInject, serverResponse: Object): ListAllGroupsResponse {
  return {
    groups: serverResponse.payload.groups
  };
}
