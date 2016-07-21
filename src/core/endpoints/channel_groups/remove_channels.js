/* @flow */

import { RemoveChannelParams, ModulesInject } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNRemoveChannelsFromGroupOperation';
}

export function validateParams(modules: ModulesInject, incomingParams: RemoveChannelParams) {
  let { channels, channelGroup } = incomingParams;
  let { config } = modules;

  if (!channelGroup) return 'Missing Channel Group';
  if (!channels || channels.length === 0) return 'Missing Channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: RemoveChannelParams): string {
  let { channelGroup } = incomingParams;
  let { config } = modules;
  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group/' + channelGroup;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules: ModulesInject, incomingParams: RemoveChannelParams): Object {
  let { channels = [] } = incomingParams;

  return {
    remove: channels.join(',')
  };
}

export function handleResponse(): Object {
  return {};
}
