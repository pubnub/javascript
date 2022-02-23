/*       */

import { TimeResponse, ModulesInject } from '../flow_interfaces';
import operationConstants from '../constants/operations';

export function getOperation() {
  return operationConstants.PNTimeOperation;
}

export function getURL() {
  return '/time/0';
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function prepareParams() {
  return {};
}

export function isAuthSupported() {
  return false;
}

export function handleResponse(modules, serverResponse) {
  return {
    timetoken: serverResponse[0],
  };
}

export function validateParams() {
  // pass
}
