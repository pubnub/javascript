/*       */

import { GrantArguments, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation() {
  return operationConstants.PNAccessManagerGrant;
}

export function validateParams(modules, incomingParams) {
  const { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!config.publishKey) return 'Missing Publish Key';
  if (!config.secretKey) return 'Missing Secret Key';
  if (incomingParams.uuids != null && !incomingParams.authKeys) {
    return 'authKeys are required for grant request on uuids';
  }
  if (incomingParams.uuids != null && (incomingParams.channels != null || incomingParams.channelGroups != null)) {
    return 'Both channel/channelgroup and uuid cannot be used in the same request';
  }
}

export function getURL(modules) {
  const { config } = modules;
  return `/v2/auth/grant/sub-key/${config.subscribeKey}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return false;
}

export function prepareParams(modules, incomingParams) {
  const {
    channels = [],
    channelGroups = [],
    uuids = [],
    ttl,
    read = false,
    write = false,
    manage = false,
    get = false,
    join = false,
    update = false,
    authKeys = [],
  } = incomingParams;
  const deleteParam = incomingParams.delete;
  const params = {};

  params.r = read ? '1' : '0';
  params.w = write ? '1' : '0';
  params.m = manage ? '1' : '0';
  params.d = deleteParam ? '1' : '0';
  params.g = get ? '1' : '0';
  params.j = join ? '1' : '0';
  params.u = update ? '1' : '0';

  if (channels.length > 0) {
    params.channel = channels.join(',');
  }

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  if (authKeys.length > 0) {
    params.auth = authKeys.join(',');
  }

  if (uuids.length > 0) {
    params['target-uuid'] = uuids.join(',');
  }

  if (ttl || ttl === 0) {
    params.ttl = ttl;
  }
  return params;
}

export function handleResponse() {
  return {};
}
