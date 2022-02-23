/*       */

import { DeleteGroupParams, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNRemoveGroupOperation;
}

export function validateParams(modules, incomingParams) {
  const { channelGroup } = incomingParams;
  const { config } = modules;

  if (!channelGroup) return 'Missing Channel Group';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules, incomingParams) {
  const { channelGroup } = incomingParams;
  const { config } = modules;
  return `/v1/channel-registration/sub-key/${config.subscribeKey}/channel-group/${utils.encodeString(
    channelGroup,
  )}/remove`;
}

export function isAuthSupported() {
  return true;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function prepareParams() {
  return {};
}

export function handleResponse() {
  return {};
}
