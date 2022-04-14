/*       */

import { GetStateArguments, GetStateResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNGetStateOperation;
}

export function validateParams(modules) {
  const { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams) {
  const { config } = modules;
  const { uuid = config.UUID, channels = [] } = incomingParams;
  const stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return `/v2/presence/sub-key/${config.subscribeKey}/channel/${utils.encodeString(stringifiedChannels)}/uuid/${uuid}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const { channelGroups = [] } = incomingParams;
  const params = {};

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  return params;
}

export function handleResponse(modules, serverResponse, incomingParams) {
  const { channels = [], channelGroups = [] } = incomingParams;
  let channelsResponse = {};

  if (channels.length === 1 && channelGroups.length === 0) {
    channelsResponse[channels[0]] = serverResponse.payload;
  } else {
    channelsResponse = serverResponse.payload;
  }

  return { channels: channelsResponse };
}
