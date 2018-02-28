/* @flow */

import { FetchHistoryArguments, HistoryResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation(): string {
  return operationConstants.PNDeleteMessagesOperation;
}

export function validateParams(modules: ModulesInject, incomingParams: FetchHistoryArguments) {
  let { channel } = incomingParams;
  let { config } = modules;

  if (!channel) return 'Missing channel';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function useDelete() {
  return true;
}

export function getURL(modules: ModulesInject, incomingParams: FetchHistoryArguments): string {
  let { channel } = incomingParams;
  let { config } = modules;

  return `/v3/history/sub-key/${config.subscribeKey}/channel/${utils.encodeString(channel)}`;
}

export function getRequestTimeout({ config }: ModulesInject): boolean {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return true;
}

export function prepareParams(modules: ModulesInject, incomingParams: FetchHistoryArguments): Object {
  const { start, end } = incomingParams;

  let outgoingParams: Object = {};

  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;

  return outgoingParams;
}

export function handleResponse(modules: ModulesInject, serverResponse: Object): HistoryResponse {
  return serverResponse.payload;
}
