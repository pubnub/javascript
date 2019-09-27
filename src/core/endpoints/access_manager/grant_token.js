/* @flow */

import { GrantTokenInput, GrantTokenObject, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation(): string {
  return operationConstants.PNAccessManagerGrantToken;
}

export function extractPermissions(permissions: GrantTokenObject) {
  let permissionsResult = 0;

  /* eslint-disable */

  if (permissions.create) {
    permissionsResult |= 16;
  }

  if (permissions.delete) {
    permissionsResult |= 8;
  }

  if (permissions.manage) {
    permissionsResult |= 4;
  }

  if (permissions.write) {
    permissionsResult |= 2;
  }

  if (permissions.read) {
    permissionsResult |= 1;
  }

  /* eslint-enable */

  return permissionsResult;
}

function prepareMessagePayload(modules, incomingParams) {
  const { ttl, resources, patterns, meta } = incomingParams;
  const params = {
    ttl: 0,
    permissions: {
      resources: {
        channels: {},
        groups: {},
        users: {},
        spaces: {}
      },
      patterns: {
        channels: {},
        groups: {},
        users: {},
        spaces: {}
      },
      meta: {}
    }
  };

  if (resources) {
    const { users, spaces } = resources;

    if (users) {
      Object.keys(users).forEach((user) => {
        params.permissions.resources.users[user] = extractPermissions(users[user]);
      });
    }

    if (spaces) {
      Object.keys(spaces).forEach((space) => {
        params.permissions.resources.spaces[space] = extractPermissions(spaces[space]);
      });
    }
  }

  if (patterns) {
    const { users, spaces } = patterns;

    if (users) {
      Object.keys(users).forEach((user) => {
        params.permissions.patterns.users[user] = extractPermissions(users[user]);
      });
    }

    if (spaces) {
      Object.keys(spaces).forEach((space) => {
        params.permissions.patterns.spaces[space] = extractPermissions(spaces[space]);
      });
    }
  }

  if (ttl || ttl === 0) {
    params.ttl = ttl;
  }

  if (meta) {
    params.permissions.meta = meta;
  }

  return params;
}

export function validateParams(
  modules: ModulesInject,
  incomingParams: GrantTokenInput
) {
  let { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!config.publishKey) return 'Missing Publish Key';
  if (!config.secretKey) return 'Missing Secret Key';

  if (!incomingParams.resources && !incomingParams.patterns) return 'Missing either Resources or Patterns.';

  if (
    (
      (incomingParams.resources) &&
      (!incomingParams.resources.users || Object.keys(incomingParams.resources.users).length === 0) &&
      (!incomingParams.resources.spaces || Object.keys(incomingParams.resources.spaces).length === 0)
    ) ||
    (
      (incomingParams.patterns) &&
      (!incomingParams.patterns.users || Object.keys(incomingParams.patterns.users).length === 0) &&
      (!incomingParams.patterns.spaces || Object.keys(incomingParams.patterns.spaces).length === 0)
    )
  ) {
    return 'Missing values for either Resources or Patterns.';
  }
}

export function postURL(modules: ModulesInject): string {
  let { config } = modules;
  return `/v3/pam/${config.subscribeKey}/grant`;
}

export function usePost() {
  return true;
}

export function getRequestTimeout({ config }: ModulesInject): number {
  return config.getTransactionTimeout();
}

export function isAuthSupported(): boolean {
  return false;
}

export function prepareParams(): Object {
  return {};
}

export function postPayload(
  modules: ModulesInject,
  incomingParams: GrantTokenInput
): Object {
  return prepareMessagePayload(modules, incomingParams);
}

export function handleResponse(
  modules: ModulesInject,
  response: Object
): string {
  let token = response.data.token;

  return token;
}
