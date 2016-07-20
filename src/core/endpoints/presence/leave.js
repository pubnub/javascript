/* @flow */

import { LeaveArguments } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNUnsubscribeOperation';
}

export function validateParams(modules) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: LeaveArguments): string {
  let { config } = modules;
  let { channels = [] } = incomingParams;
  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return '/v2/presence/sub-key/' + config.subscribeKey + '/channel/' + encodeURIComponent(stringifiedChannels) + '/leave';
}

export function prepareParams(modules, incomingParams: LeaveArguments): Object {
  let { channelGroups = [] } = incomingParams;
  let params = {};

  if (channelGroups.length > 0) {
    params['channel-group'] = encodeURIComponent(channelGroups.join(','));
  }

  return params;
}

export function handleResponse(): Object {
  return {};
}
