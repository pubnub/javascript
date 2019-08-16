/* @flow */

import {
  MembershipsInput,
  MembershipsListResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

function prepareMessagePayload(modules, messagePayload) {
  let stringifiedPayload = JSON.stringify(messagePayload);

  return stringifiedPayload;
}

export function getOperation(): string {
  return operationConstants.PNUpdateMembershipsOperation;
}

export function validateParams(
  modules: ModulesInject,
  incomingParams: MembershipsInput
) {
  let { userId, spaces } = incomingParams;

  if (!userId) return 'Missing userId';
  if (!spaces) return 'Missing spaces';
}

export function getURL(
  modules: ModulesInject,
  incomingParams: MembershipsInput
): string {
  let { config } = modules;

  return `/v1/objects/${config.subscribeKey}/users/${incomingParams.userId}/spaces`;
}

export function patchURL(
  modules: ModulesInject,
  incomingParams: MembershipsInput
): string {
  let { config } = modules;

  return `/v1/objects/${config.subscribeKey}/users/${incomingParams.userId}/spaces`;
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
  incomingParams: MembershipsInput
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
  incomingParams: MembershipsInput
): string {
  const { spaces } = incomingParams;
  let payload = {};

  if (spaces && spaces.length > 0) {
    payload.remove = [];

    spaces.forEach((removeMembershipId) => {
      payload.remove.push({ id: removeMembershipId });
    });
  }

  return prepareMessagePayload(modules, payload);
}

export function handleResponse(
  modules: ModulesInject,
  membershipsResponse: Object
): MembershipsListResponse {
  return membershipsResponse;
}
