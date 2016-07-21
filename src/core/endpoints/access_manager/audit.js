/* @flow */

import { AuditArguments } from '../../flow_interfaces';

export function getOperation(): string {
  return 'PNAccessManagerAudit';
}

export function validateParams(modules) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules): string {
  let { config } = modules;
  return '/v1/auth/audit/sub-key/' + config.subscribeKey;
}

export function prepareParams(modules, incomingParams: AuditArguments): Object {
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

export function handleResponse(modules, serverResponse: Object): Object {
  return serverResponse.payload;
}
