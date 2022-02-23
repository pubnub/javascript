/*       */

import { HeartbeatArguments, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation()         {
  return operationConstants.PNHeartbeatOperation;
}

export function validateParams(modules               ) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function getURL(modules               , incomingParams                    )         {
  let { config } = modules;
  let { channels = [] } = incomingParams;
  let stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return `/v2/presence/sub-key/${config.subscribeKey}/channel/${utils.encodeString(stringifiedChannels)}/heartbeat`;
}

export function isAuthSupported() {
  return true;
}

export function getRequestTimeout({ config }               ) {
  return config.getTransactionTimeout();
}

export function prepareParams(modules               , incomingParams                    )         {
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

export function handleResponse()         {
  return {};
}
