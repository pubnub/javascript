/*       */

import {
  MembershipsInput,
  MembershipsListResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

function prepareMessagePayload(modules, incomingParams) {
  const { spaces } = incomingParams;
  let payload = {};

  if (spaces && spaces.length > 0) {
    payload.remove = [];

    spaces.forEach((removeMembershipId) => {
      payload.remove.push({ id: removeMembershipId });
    });
  }

  return payload;
}

export function getOperation()         {
  return operationConstants.PNUpdateMembershipsOperation;
}

export function validateParams(
  modules               ,
  incomingParams                  
) {
  let { userId, spaces } = incomingParams;

  if (!userId) return 'Missing userId';
  if (!spaces) return 'Missing spaces';
}

export function getURL(
  modules               ,
  incomingParams                  
)         {
  let { config } = modules;

  return `/v1/objects/${config.subscribeKey}/users/${utils.encodeString(incomingParams.userId)}/spaces`;
}

export function patchURL(
  modules               ,
  incomingParams                  
)         {
  let { config } = modules;

  return `/v1/objects/${config.subscribeKey}/users/${utils.encodeString(incomingParams.userId)}/spaces`;
}

export function usePatch() {
  return true;
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
  const { include, limit, page } = incomingParams;
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

    if (include.spaceFields) {
      includes.push('space');
    }

    if (include.customSpaceFields) {
      includes.push('space.custom');
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

  return params;
}

export function patchPayload(
  modules               ,
  incomingParams                  
)         {
  return prepareMessagePayload(modules, incomingParams);
}

export function handleResponse(
  modules               ,
  membershipsResponse        
)                          {
  return membershipsResponse;
}
