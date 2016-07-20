/* @flow */

import { TimeResponse } from '../flow_interfaces';

export function getOperation(): string {
  return 'PNTimeOperation';
}

export function getURL(): string {
  return '/time/0';
}

export function prepareParams(): Object {
  return {};
}

export function handleResponse(params: Object, serverResponse: Object): TimeResponse {
  return {
    timetoken: serverResponse[0]
  };
}

export function validateParams() {
  // pass
}
