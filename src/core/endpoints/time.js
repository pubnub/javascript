/* @flow */

import { TimeResponse, ModulesInject } from '../flow_interfaces';
import operationConstants from '../constants/operations';

export function getOperation(): string {
  return operationConstants.PNTimeOperation;
}

export function getURL(): string {
  return '/time/0';
}

export function getRequestTimeout({ config }: ModulesInject): number {
  return config.getTransactionTimeout();
}

export function prepareParams(): Object {
  return {};
}

export function isAuthSupported(): boolean {
  return false;
}

export function handleResponse(modules: ModulesInject, serverResponse: Object): TimeResponse {
  return {
    timetoken: serverResponse[0]
  };
}

export function validateParams() {
  // pass
}
