/*       */

import { WhereNowArguments, WhereNowResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNWhereNowOperation;
}

export function validateParams(modules) {
  const { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams) {
  const { config } = modules;
  const { uuid = config.UUID } = incomingParams;
  return `/v2/presence/sub-key/${config.subscribeKey}/uuid/${utils.encodeString(uuid)}`;
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
  // This is a quick fix for when the server does not include a payload
  // in where now responses
  if (!serverResponse.payload) {
    return { channels: [] };
  }
  return { channels: serverResponse.payload.channels };
}
