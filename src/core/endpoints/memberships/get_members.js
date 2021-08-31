/* @flow */

import {
  MembersInput,
  MembersListResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

export function getOperation(): string {
  return operationConstants.PNGetMembersOperation;
}

export function validateParams(modules: ModulesInject, incomingParams: MembersInput) {
  let { spaceId } = incomingParams;

  if (!spaceId) return 'Missing spaceId';
}

export function getURL(
  modules: ModulesInject,
  incomingParams: MembersInput
): string {
  let { config } = modules;

  return `/v1/objects/${config.subscribeKey}/spaces/${utils.encodeString(incomingParams.spaceId)}/users`;
}

export function getRequestTimeout({ config }: ModulesInject) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(
  modules: ModulesInject,
  incomingParams: MembersInput
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

    if (include.userFields) {
      includes.push('user');
    }

    if (include.customUserFields) {
      includes.push('user.custom');
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
  membersResponse: Object
): MembersListResponse {
  return membersResponse;
}
