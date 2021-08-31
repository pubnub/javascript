/* @flow */

import {
  MembersInput,
  MembersListResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

function prepareMessagePayload(modules, incomingParams) {
  const { users } = incomingParams;
  let payload = {};

  if (users && users.length > 0) {
    payload.remove = [];

    users.forEach((removeMemberId) => {
      payload.remove.push({ id: removeMemberId });
    });
  }

  return payload;
}

export function getOperation(): string {
  return operationConstants.PNUpdateMembersOperation;
}

export function validateParams(
  modules: ModulesInject,
  incomingParams: MembersInput
) {
  let { spaceId, users } = incomingParams;

  if (!spaceId) return 'Missing spaceId';
  if (!users) return 'Missing users';
}

export function getURL(
  modules: ModulesInject,
  incomingParams: MembersInput
): string {
  let { config } = modules;

  return `/v1/objects/${config.subscribeKey}/spaces/${utils.encodeString(incomingParams.spaceId)}/users`;
}

export function patchURL(
  modules: ModulesInject,
  incomingParams: MembersInput
): string {
  let { config } = modules;

  return `/v1/objects/${config.subscribeKey}/spaces/${utils.encodeString(incomingParams.spaceId)}/users`;
}

export function usePatch() {
  return true;
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
  modules: ModulesInject,
  incomingParams: MembersInput
): Object {
  return prepareMessagePayload(modules, incomingParams);
}

export function handleResponse(
  modules: ModulesInject,
  membersResponse: Object
): MembersListResponse {
  return membersResponse;
}
