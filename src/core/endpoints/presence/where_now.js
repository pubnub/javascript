/* @flow */

import { WhereNowArguments, WhereNowResponse } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNWhereNowOperation';
}

export function validateParams(modules) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: WhereNowArguments): string {
  let { config } = modules;
  let { uuid = config.UUID } = incomingParams;
  return '/v2/presence/sub-key/' + config.subscribeKey + '/uuid/' + uuid;
}

export function prepareParams(): Object {
  return {};
}

export function handleResponse(modules, serverResponse: Object): WhereNowResponse {
  return { channels: serverResponse.payload.channels };
}
