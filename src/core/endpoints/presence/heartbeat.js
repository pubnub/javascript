/* @flow */

import { HeartbeatArguments } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNHeartbeatOperation';
}

export function validateParams(modules) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: HeartbeatArguments): string {
  let { config } = modules;
  let { channels = [] } = incomingParams;
  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return '/v2/presence/sub-key/' + config.subscribeKey + '/channel/' + encodeURIComponent(stringifiedChannels) + '/heartbeat';
}

export function prepareParams(modules, incomingParams: HeartbeatArguments): Object {
  let { channelGroups = [], state = {} } = incomingParams;
  let { config } = modules;
  const params = {};

  if (channelGroups.length > 0) {
    params['channel-group'] = encodeURIComponent(channelGroups.join(','));
  }

  params.state = JSON.stringify(state);
  params.heartbeat = config.getPresenceTimeout();
  return params;
}

export function handleResponse(): Object {
  return {};
}
