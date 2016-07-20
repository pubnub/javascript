/* @flow */

import { RemoveChannelParams } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNRemoveChannelsFromGroupOperation';
}

export function validateParams(modules, incomingParams: RemoveChannelParams) {
  let { channels, channelGroup } = incomingParams;
  let { config } = modules;

  if (!channelGroup) return 'Missing Channel Group';
  if (!channels || channels.length === 0) return 'Missing Channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: RemoveChannelParams): string {
  let { channelGroup } = incomingParams;
  let { config } = modules;
  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group/' + channelGroup;
}

export function prepareParams(modules, incomingParams: RemoveChannelParams): Object {
  let { channels = [] } = incomingParams;

  return {
    remove: channels.join(',')
  };
}

export function handleResponse(): Object {
  return {};
}
