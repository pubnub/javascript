/*       */

import { AddMembers, UpdateMembers, MembersInput, MembersListResponse, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';
import utils from '../../utils';

function prepareMessagePayload(modules, incomingParams) {
  const { addMembers, updateMembers, removeMembers, users } = incomingParams;
  const payload = {};

  if (addMembers && addMembers.length > 0) {
    payload.add = [];

    addMembers.forEach((addMember) => {
      const currentAdd = { id: addMember.id };

      if (addMember.custom) {
        currentAdd.custom = addMember.custom;
      }

      payload.add.push(currentAdd);
    });
  }

  if (updateMembers && updateMembers.length > 0) {
    payload.update = [];

    updateMembers.forEach((updateMember) => {
      const currentUpdate = { id: updateMember.id };

      if (updateMember.custom) {
        currentUpdate.custom = updateMember.custom;
      }

      payload.update.push(currentUpdate);
    });
  }

  // if users is present then it is an update
  if (users && users.length > 0) {
    payload.update = payload.update || [];

    users.forEach((updateMember) => {
      const currentUpdate = { id: updateMember.id };

      if (updateMember.custom) {
        currentUpdate.custom = updateMember.custom;
      }

      payload.update.push(currentUpdate);
    });
  }

  if (removeMembers && removeMembers.length > 0) {
    payload.remove = [];

    removeMembers.forEach((removeMemberId) => {
      payload.remove.push({ id: removeMemberId });
    });
  }

  return payload;
}

export function getOperation() {
  return operationConstants.PNUpdateMembersOperation;
}

export function validateParams(modules, incomingParams) {
  const { spaceId, users } = incomingParams;

  if (!spaceId) return 'Missing spaceId';
  if (!users) return 'Missing users';
}

export function getURL(modules, incomingParams) {
  const { config } = modules;

  return `/v1/objects/${config.subscribeKey}/spaces/${utils.encodeString(incomingParams.spaceId)}/users`;
}

export function patchURL(modules, incomingParams) {
  const { config } = modules;

  return `/v1/objects/${config.subscribeKey}/spaces/${utils.encodeString(incomingParams.spaceId)}/users`;
}

export function usePatch() {
  return true;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const { include, limit, page } = incomingParams;
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

  return params;
}

export function patchPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

export function handleResponse(modules, membersResponse) {
  return membersResponse;
}
