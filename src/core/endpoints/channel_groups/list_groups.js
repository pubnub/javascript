/* @flow */

import { ListAllGroupsResponse } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNChannelGroupsOperation';
}

export function validateParams(modules) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules): string {
  let { config } = modules;
  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group';
}

export function prepareParams(): Object {
  return {};
}

export function handleResponse(modules, payload): ListAllGroupsResponse {
  return {
    groups: payload.payload.groups
  };
}
