/*       */

import { MembershipsInput, MembershipsListResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation() {
  return operationConstants.PNGetMembershipsOperation;
}

export function validateParams(modules, incomingParams) {
  const { userId } = incomingParams;

  if (!userId) return 'Missing userId';
}

export function getURL(modules, incomingParams) {
  const { config } = modules;

  return `/v1/objects/${config.subscribeKey}/users/${utils.encodeString(incomingParams.userId)}/spaces`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const { include, limit, page, filter } = incomingParams;
  const params = {};

  if (limit) {
    params.limit = limit;
  }

  if (include) {
    const includes = [];

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

    const includesString = includes.join(',');

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

export function handleResponse(modules, membershipsResponse) {
  return membershipsResponse;
}
