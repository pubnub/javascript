/* @flow */

import {
  SpaceListInput,
  SpacesListResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation(): string {
  return operationConstants.PNGetSpacesOperation;
}

export function validateParams() {
  // no required parameters
}

export function getURL(
  modules: ModulesInject
): string {
  let { config } = modules;

  return `/v1/objects/${config.subscribeKey}/spaces`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(
  modules: ModulesInject,
  incomingParams: SpaceListInput
): Object {
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
  modules: ModulesInject,
  spacesResponse: Object
): SpacesListResponse {
  return spacesResponse;
}
