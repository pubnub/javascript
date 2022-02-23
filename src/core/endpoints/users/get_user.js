/*       */

import { SingleUserInput, UsersResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNGetUserOperation;
}

export function validateParams(modules, incomingParams) {
  const { userId } = incomingParams;

  if (!userId) return 'Missing userId';
}

export function getURL(modules, incomingParams) {
  const { config } = modules;

  return `/v1/objects/${config.subscribeKey}/users/${utils.encodeString(incomingParams.userId)}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  let { include } = incomingParams;
  const params = {};

  // default to include custom fields in response
  if (!include) {
    include = {
      customFields: true,
    };
  } else if (include.customFields === undefined) {
    include.customFields = true;
  }

  if (include) {
    const includes = [];

    if (include.customFields) {
      includes.push('custom');
    }

    const includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  return params;
}

export function handleResponse(modules, usersResponse) {
  return usersResponse;
}
