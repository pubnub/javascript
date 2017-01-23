/* @flow */

import { DeleteGroupParams, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation(): string {
  return operationConstants.PNRemoveGroupOperation;
}

export function validateParams(modules: ModulesInject, incomingParams: DeleteGroupParams) {
  let { channelGroup } = incomingParams;
  let { config } = modules;

  if (!channelGroup) return 'Missing Channel Group';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: DeleteGroupParams): string {
  let { channelGroup } = incomingParams;
  let { config } = modules;
  return `/v1/channel-registration/sub-key/${config.subscribeKey}/channel-group/${utils.encodeString(channelGroup)}/remove`;
}

export function isAuthSupported() {
  return true;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function prepareParams(): Object {
  return {};
}

export function handleResponse(): Object {
  return {};
}
