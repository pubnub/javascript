/*       */

import { SpacesResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation()         {
  return operationConstants.PNDeleteSpaceOperation;
}

export function validateParams({ config }               , spaceId        ) {
  if (!spaceId) return 'Missing SpaceId';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function useDelete() {
  return true;
}

export function getURL(modules               , spaceId        )         {
  let { config } = modules;
  return `/v1/objects/${config.subscribeKey}/spaces/${utils.encodeString(spaceId)}`;
}

export function getRequestTimeout({ config }               ) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams()         {
  return {};
}

export function handleResponse(
  modules               ,
  spacesResponse        
)                 {
  return spacesResponse;
}
