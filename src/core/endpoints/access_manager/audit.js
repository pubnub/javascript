/* @flow */

import { AuditArguments, ModulesInject } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNAccessManagerAudit';
}

export function validateParams(modules: ModulesInject) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject): string {
  let { config } = modules;
  return '/v1/auth/audit/sub-key/' + config.subscribeKey;
}

export function getRequestTimeout({ config }: ModulesInject): number {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return false;
}

export function prepareParams(modules: ModulesInject, incomingParams: AuditArguments): Object {
  const { channel, channelGroup, authKeys = [] } = incomingParams;
  const params = {};

  params.timestamp = Math.floor(new Date().getTime() / 1000);

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

export function handleResponse(modules: ModulesInject, serverResponse: Object): Object {
  return serverResponse.payload;
}
