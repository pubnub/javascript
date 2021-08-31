/* @flow */

import {
  AddMemberships,
  UpdateMemberships,
  MembershipsInput,
  MembershipsListResponse,
  ModulesInject,
} from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

function prepareMessagePayload(modules, incomingParams) {
  const { addMemberships, updateMemberships, removeMemberships, spaces } = incomingParams;
  let payload = {};

  if (addMemberships && addMemberships.length > 0) {
    payload.add = [];

    addMemberships.forEach((addMembership) => {
      let currentAdd: AddMemberships = { id: addMembership.id };

      if (addMembership.custom) {
        currentAdd.custom = addMembership.custom;
      }

      payload.add.push(currentAdd);
    });
  }

  if (updateMemberships && updateMemberships.length > 0) {
    payload.update = [];

    updateMemberships.forEach((updateMembership) => {
      let currentUpdate: UpdateMemberships = { id: updateMembership.id };

      if (updateMembership.custom) {
        currentUpdate.custom = updateMembership.custom;
      }

      payload.update.push(currentUpdate);
    });
  }

  // if spaces is present then it is an update
  if (spaces && spaces.length > 0) {
    payload.update = payload.update || [];

    spaces.forEach((updateMembership) => {
      let currentUpdate: UpdateMemberships = { id: updateMembership.id };

      if (updateMembership.custom) {
        currentUpdate.custom = updateMembership.custom;
      }

      payload.update.push(currentUpdate);
    });
  }

  if (removeMemberships && removeMemberships.length > 0) {
    payload.remove = [];

    removeMemberships.forEach((removeMembershipId) => {
      payload.remove.push({ id: removeMembershipId });
    });
  }

  return payload;
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

  return `/v1/objects/${config.subscribeKey}/users/${utils.encodeString(incomingParams.userId)}/spaces`;
}

export function patchURL(
  modules: ModulesInject,
  incomingParams: MembershipsInput
): string {
  let { config } = modules;

  return `/v1/objects/${config.subscribeKey}/users/${utils.encodeString(incomingParams.userId)}/spaces`;
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
): Object {
  return prepareMessagePayload(modules, incomingParams);
}

export function handleResponse(
  modules: ModulesInject,
  membershipsResponse: Object
): MembershipsListResponse {
  return membershipsResponse;
}
