/* @flow */

import { GrantArguments, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation(): string {
  return operationConstants.PNAccessManagerGrant;
}

export function validateParams(modules: ModulesInject) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!config.publishKey) return 'Missing Publish Key';
  if (!config.secretKey) return 'Missing Secret Key';
}

export function getURL(modules: ModulesInject): string {
  let { config } = modules;
  return `/v2/auth/grant/sub-key/${config.subscribeKey}`;
}

export function getRequestTimeout({ config }: ModulesInject): number {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return false;
}

export function prepareParams(modules: ModulesInject, incomingParams: GrantArguments): Object {
  const { channels = [], channelGroups = [], ttl, read = false, write = false, manage = false, authKeys = [] } = incomingParams;
  const params = {};

  params.r = (read) ? '1' : '0';
  params.w = (write) ? '1' : '0';
  params.m = (manage) ? '1' : '0';

  if (channels.length > 0) {
    params.channel = channels.join(',');
  }

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  if (authKeys.length > 0) {
    params.auth = authKeys.join(',');
  }

  if (ttl || ttl === 0) {
    params.ttl = ttl;
  }

  return params;
}

export function handleResponse(): Object {
  return {};
}
