/*       */

import { RemoveChannelParams, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNRemoveChannelsFromGroupOperation;
}

export function validateParams(modules, incomingParams) {
  const { channels, channelGroup } = incomingParams;
  const { config } = modules;

  if (!channelGroup) return 'Missing Channel Group';
  if (!channels || channels.length === 0) return 'Missing Channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams) {
  const { channelGroup } = incomingParams;
  const { config } = modules;
  return `/v1/channel-registration/sub-key/${config.subscribeKey}/channel-group/${utils.encodeString(channelGroup)}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const { channels = [] } = incomingParams;

  return {
    remove: channels.join(','),
  };
}

export function handleResponse() {
  return {};
}
