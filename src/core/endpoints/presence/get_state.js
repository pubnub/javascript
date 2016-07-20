/* @flow */

import { GetStateArguments, GetStateResponse } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNGetStateOperation';
}

export function validateParams(modules) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: GetStateArguments): string {
  let { config } = modules;
  let { uuid = config.UUID, channels = [] } = incomingParams;
  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return '/v2/presence/sub-key/' + config.subscribeKey + '/channel/' + stringifiedChannels + '/uuid/' + uuid;
}

export function prepareParams(modules, incomingParams: GetStateArguments): Object {
  let { channelGroups = [] } = incomingParams;
  const params = {};

  if (channelGroups.length > 0) {
    params['channel-group'] = encodeURIComponent(channelGroups.join(','));
  }

  return params;
}

export function handleResponse(modules, serverResponse: Object, incomingParams: GetStateArguments): GetStateResponse {
  let { channels = [], channelGroups = [] } = incomingParams;
  let channelsResponse = {};

  if (channels.length === 1 && channelGroups.length === 0) {
    channelsResponse[channels[0]] = serverResponse.payload;
  } else {
    channelsResponse = serverResponse.payload;
  }

  return { channels: channelsResponse };
}
