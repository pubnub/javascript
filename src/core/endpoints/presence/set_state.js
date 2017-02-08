/* @flow */

import { SetStateArguments, SetStateResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation(): string {
  return operationConstants.PNSetStateOperation;
}

export function validateParams(modules: ModulesInject, incomingParams: SetStateArguments) {
  let { config } = modules;
  let { state, channels = [], channelGroups = [] } = incomingParams;

  if (!state) return 'Missing State';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (channels.length === 0 && channelGroups.length === 0) return 'Please provide a list of channels and/or channel-groups';
}

export function getURL(modules: ModulesInject, incomingParams: SetStateArguments): string {
  let { config } = modules;
  let { channels = [] } = incomingParams;
  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return `/v2/presence/sub-key/${config.subscribeKey}/channel/${utils.encodeString(stringifiedChannels)}/uuid/${config.UUID}/data`;
}

export function getRequestTimeout({ config }: ModulesInject): number {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return true;
}

export function prepareParams(modules: ModulesInject, incomingParams: SetStateArguments): Object {
  let { state, channelGroups = [] } = incomingParams;
  const params = {};

  params.state = JSON.stringify(state);

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  return params;
}

export function handleResponse(modules: ModulesInject, serverResponse: Object): SetStateResponse {
  return { state: serverResponse.payload };
}
