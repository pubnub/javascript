/*       */

import { ListAllGroupsResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation() {
  return operationConstants.PNChannelGroupsOperation;
}

export function validateParams(modules) {
  const { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules) {
  const { config } = modules;
  return `/v1/channel-registration/sub-key/${config.subscribeKey}/channel-group`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams() {
  return {};
}

export function handleResponse(modules, serverResponse) {
  return {
    groups: serverResponse.payload.groups,
  };
}
