/*       */

import {
  UserListInput,
  UsersListResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation()         {
  return operationConstants.PNGetUsersOperation;
}

export function validateParams() {
  // no required parameters
}

export function getURL(
  modules               ,
)         {
  let { config } = modules;
  return `/v1/objects/${config.subscribeKey}/users`;
}

export function getRequestTimeout({ config }               ) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(
  modules               ,
  incomingParams               
)         {
  const { include, limit, page, filter } = incomingParams;
  const params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    let includes = [];

    if (include.totalCount) {
      params.count = true;
    }

    if (include.customFields) {
      includes.push('custom');
    }

    let includesString = includes.join(',');

    if (includesString.length > 0) {
      params.include = includesString;
    }
  }

  if (page) {
    if (page.next) {
      params.start = page.next;
    }
    if (page.prev) {
      params.end = page.prev;
    }
  }

  if (filter) {
    params.filter = filter;
  }

  return params;
}

export function handleResponse(
  modules               ,
  usersResponse        
)                    {
  return usersResponse;
}
