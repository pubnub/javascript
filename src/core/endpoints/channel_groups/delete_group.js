/* @flow */

import { DeleteGroupParams } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNRemoveGroupOperation';
}

export function validateParams(modules, incomingParams: DeleteGroupParams) {
  let { channelGroup } = incomingParams;
  let { config } = modules;

  if (!channelGroup) return 'Missing Channel Group';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: DeleteGroupParams): string {
  let { channelGroup } = incomingParams;
  let { config } = modules;
  return '/v1/channel-registration/sub-key/' + config.subscribeKey + '/channel-group/' + channelGroup + '/remove';
}

export function prepareParams(): Object {
  return {};
}

export function handleResponse(): Object {
  return {};
}
