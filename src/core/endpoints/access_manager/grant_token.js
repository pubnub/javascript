/* @flow */
/* eslint camelcase: 0 */

import { GrantTokenInput, GrantTokenObject, ModulesInject } from '../../flow_interfaces';
import operationConstants from '../../constants/operations';

export function getOperation(): string {
  return operationConstants.PNAccessManagerGrantToken;
}

export function extractPermissions(permissions: GrantTokenObject) {
  let permissionsResult = 0;

  /* eslint-disable */

  if (permissions.join) {
    permissionsResult |= 128;
  }

  if (permissions.update) {
    permissionsResult |= 64;
  }

  if (permissions.get) {
    permissionsResult |= 32;
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
  const { ttl, resources, patterns, meta, authorized_uuid } = incomingParams;
  const params: any = {
    ttl: 0,
    permissions: {
      resources: {
        channels: {},
        groups: {},
        uuids: {},
        users: {}, // not used, needed for api backward compatibility
        spaces: {} // not used, needed for api backward compatibility
      },
      patterns: {
        channels: {},
        groups: {},
        uuids: {},
        users: {}, // not used, needed for api backward compatibility
        spaces: {} // not used, needed for api backward compatibility
      },
      meta: {}
    }
  };

  if (resources) {
    const { uuids, channels, groups } = resources;

    if (uuids) {
      Object.keys(uuids).forEach((uuid) => {
        params.permissions.resources.uuids[uuid] = extractPermissions(uuids[uuid]);
      });
    }

    if (channels) {
      Object.keys(channels).forEach((channel) => {
        params.permissions.resources.channels[channel] = extractPermissions(channels[channel]);
      });
    }

    if (groups) {
      Object.keys(groups).forEach((group) => {
        params.permissions.resources.groups[group] = extractPermissions(groups[group]);
      });
    }
  }

  if (patterns) {
    const { uuids, channels, groups } = patterns;

    if (uuids) {
      Object.keys(uuids).forEach((uuid) => {
        params.permissions.patterns.uuids[uuid] = extractPermissions(uuids[uuid]);
      });
    }

    if (channels) {
      Object.keys(channels).forEach((channel) => {
        params.permissions.patterns.channels[channel] = extractPermissions(channels[channel]);
      });
    }

    if (groups) {
      Object.keys(groups).forEach((group) => {
        params.permissions.patterns.groups[group] = extractPermissions(groups[group]);
      });
    }
  }

  if (ttl || ttl === 0) {
    params.ttl = ttl;
  }

  if (meta) {
    params.permissions.meta = meta;
  }

  if (authorized_uuid) {
    params.permissions.uuid = `${authorized_uuid}`; // ensure this is a string
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
      (!incomingParams.resources.uuids || Object.keys(incomingParams.resources.uuids).length === 0) &&
      (!incomingParams.resources.channels || Object.keys(incomingParams.resources.channels).length === 0) &&
      (!incomingParams.resources.groups || Object.keys(incomingParams.resources.groups).length === 0)
    ) ||
    (
      (incomingParams.patterns) &&
      (!incomingParams.patterns.uuids || Object.keys(incomingParams.patterns.uuids).length === 0) &&
      (!incomingParams.patterns.channels || Object.keys(incomingParams.patterns.channels).length === 0) &&
      (!incomingParams.patterns.groups || Object.keys(incomingParams.patterns.groups).length === 0)
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
