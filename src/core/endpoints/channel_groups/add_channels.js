/* @flow */

import { AddChannelParams } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNAddChannelsToGroupOperation';
}

export function validateParams(modules, incomingParams: AddChannelParams) {
  let { channels, channelGroup } = incomingParams;
  let { config } = modules;

  if (!channelGroup) return 'Missing Channel Group';
  if (!channels || channels.length === 0) return 'Missing Channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: AddChannelParams): string {
  let { channelGroup } = incomingParams;
  let { config } = modules;
  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group/' + channelGroup;
}

export function prepareParams(modules, incomingParams: AddChannelParams): Object {
  let { channels = [] } = incomingParams;

  return {
    add: channels.join(',')
  };
}

export function handleResponse(): Object {
  return {};
}
