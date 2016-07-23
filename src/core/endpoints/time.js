/* @flow */

import { TimeResponse, ModulesInject } from '../flow_interfaces';

export function getOperation(): string {
  return 'PNTimeOperation';
}

export function getURL(): string {
  return '/time/0';
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function prepareParams(): Object {
  return {};
}

export function isAuthSupported() {
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
