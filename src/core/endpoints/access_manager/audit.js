/*       */

import { AuditArguments, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation() {
  return operationConstants.PNAccessManagerAudit;
}

export function validateParams(modules) {
  const { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules) {
  const { config } = modules;
  return `/v2/auth/audit/sub-key/${config.subscribeKey}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return false;
}

export function prepareParams(modules, incomingParams) {
  const { channel, channelGroup, authKeys = [] } = incomingParams;
  const params = {};

  if (channel) {
    params.channel = channel;
  }

  if (channelGroup) {
    params['channel-group'] = channelGroup;
  }

  if (authKeys.length > 0) {
    params.auth = authKeys.join(',');
  }

  return params;
}

export function handleResponse(modules, serverResponse) {
  return serverResponse.payload;
}
