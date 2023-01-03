/*       */

import { SetStateArguments, SetStateResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNSetStateOperation;
}

export function validateParams(modules, incomingParams) {
  const { config } = modules;
  const { state, channels = [], channelGroups = [] } = incomingParams;

  if (!state) return 'Missing State';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (channels.length === 0 && channelGroups.length === 0) {
    return 'Please provide a list of channels and/or channel-groups';
  }
}

export function getURL(modules, incomingParams) {
  const { config } = modules;
  const { channels = [] } = incomingParams;
  const stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return `/v2/presence/sub-key/${config.subscribeKey}/channel/${utils.encodeString(
    stringifiedChannels,
  )}/uuid/${utils.encodeString(config.UUID)}/data`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const { state, channelGroups = [] } = incomingParams;
  const params = {};

  params.state = JSON.stringify(state);

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  return params;
}

export function handleResponse(modules, serverResponse) {
  return { state: serverResponse.payload };
}
