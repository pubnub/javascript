/*       */

import { UsersResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation()         {
  return operationConstants.PNDeleteUserOperation;
}

export function validateParams({ config }               , userId        ) {
  if (!userId) return 'Missing UserId';
  if (!config.subscribeKey) return 'Missing Subscribe Key';
}

export function useDelete() {
  return true;
}

export function getURL(modules               , userId        )         {
  let { config } = modules;
  return `/v1/objects/${config.subscribeKey}/users/${utils.encodeString(userId)}`;
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
  usersResponse        
)                {
  return usersResponse;
}
