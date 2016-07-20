/* @flow */

import { SetStateArguments, SetStateResponse } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNSetStateOperation';
}

export function validateParams(modules, incomingParams: SetStateArguments) {
  let { config } = modules;
  let { state } = incomingParams;

  if (!state) return 'Missing State';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams: SetStateArguments): string {
  let { config } = modules;
  let { channels = [] } = incomingParams;
  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return '/v2/presence/sub-key/' + config.subscribeKey + '/channel/' + stringifiedChannels + '/uuid/' + config.UUID + '/data';
}

export function prepareParams(modules, incomingParams: SetStateArguments): Object {
  let { state, channelGroups = [] } = incomingParams;
  const params = {};

  params.state = encodeURIComponent(JSON.stringify(state));

  if (channelGroups.length > 0) {
    params['channel-group'] = encodeURIComponent(channelGroups.join(','));
  }

  return params;
}

export function handleResponse(modules, serverResponse: Object): SetStateResponse {
  return { state: serverResponse.payload };
}
