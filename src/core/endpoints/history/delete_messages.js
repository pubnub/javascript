/*       */

import { FetchHistoryArguments, HistoryResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNDeleteMessagesOperation;
}

export function validateParams(modules, incomingParams) {
  const { channel } = incomingParams;
  const { config } = modules;

  if (!channel) return 'Missing channel';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function useDelete() {
  return true;
}

export function getURL(modules, incomingParams) {
  const { channel } = incomingParams;
  const { config } = modules;

  return `/v3/history/sub-key/${config.subscribeKey}/channel/${utils.encodeString(channel)}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const { start, end } = incomingParams;

  const outgoingParams = {};

  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;

  return outgoingParams;
}

export function handleResponse(modules, serverResponse) {
  return serverResponse.payload;
}
