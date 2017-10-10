/* @flow */

import { HeartbeatArguments, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation(): string {
  return operationConstants.PNHeartbeatOperation;
}

export function validateParams(modules: ModulesInject) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules: ModulesInject, incomingParams: HeartbeatArguments): string {
  let { config, telemetry } = modules;
  let { channels = [] } = incomingParams;

  let fields = telemetry.get();
  let querystring = '';

  Object.keys(fields).forEach((key) => {
    querystring += `${(querystring !== '' ? '&' : '')}${key}=${fields[key]}`;
  });

  if (querystring !== '') {
    querystring = `?${querystring}`;
  }

  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return `/v2/presence/sub-key/${config.subscribeKey}/channel/${utils.encodeString(stringifiedChannels)}/heartbeat${querystring}`;
}

export function isAuthSupported() {
  return true;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function prepareParams(modules: ModulesInject, incomingParams: HeartbeatArguments): Object {
  let { channelGroups = [], state = {} } = incomingParams;
  let { config } = modules;
  const params = {};

  if (channelGroups.length > 0) {
    params['channel-group'] = channelGroups.join(',');
  }

  params.state = JSON.stringify(state);
  params.heartbeat = config.getPresenceTimeout();
  return params;
}

export function handleResponse(): Object {
  return {};
}
