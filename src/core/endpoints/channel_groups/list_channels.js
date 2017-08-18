/* @flow */

import { ListChannelsParams, ListChannelsResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import validate from '../../parameters_validator';
import utils from '../../utils';

const expectedParams = {
  channelGroup: 'string',
  callback: 'function'
};

export function getOperation(): string {
  return operationConstants.PNChannelsForGroupOperation;
}

export function validateParams(modules: ModulesInject, incomingParams: ListChannelsParams) {
  let { channelGroup } = incomingParams;
  let { config } = modules;

  if (!channelGroup) return 'Missing Channel Group';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  return validate(expectedParams, incomingParams);
}

export function getURL(modules: ModulesInject, incomingParams: ListChannelsParams): string {
  let { channelGroup } = incomingParams;
  let { config } = modules;
  return `/v1/channel-registration/sub-key/${config.subscribeKey}/channel-group/${utils.encodeString(channelGroup)}`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(): Object {
  return {};
}

export function handleResponse(modules: ModulesInject, serverResponse: Object): ListChannelsResponse {
  return {
    channels: serverResponse.payload.channels
  };
}
