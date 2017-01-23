/* @flow */

import { WhereNowArguments, WhereNowResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation(): string {
  return operationConstants.PNWhereNowOperation;
}

export function validateParams(modules: ModulesInject) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: WhereNowArguments): string {
  let { config } = modules;
  let { uuid = config.UUID } = incomingParams;
  return `/v2/presence/sub-key/${config.subscribeKey}/uuid/${uuid}`;
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

export function handleResponse(modules: ModulesInject, serverResponse: Object): WhereNowResponse {
  return { channels: serverResponse.payload.channels };
}
