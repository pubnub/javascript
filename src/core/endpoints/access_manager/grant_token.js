import operationConstants from '../../constants/operations';

export function getOperation() {
  return operationConstants.PNAccessManagerGrantToken;
}

function hasVspTerms(incomingParams) {
  const hasAuthorizedUserId = incomingParams?.authorizedUserId !== undefined;
  const hasUserResources = incomingParams?.resources?.users !== undefined;
  const hasSpaceResources = incomingParams?.resources?.spaces !== undefined;
  const hasUserPatterns = incomingParams?.patterns?.users !== undefined;
  const hasSpacePatterns = incomingParams?.patterns?.spaces !== undefined;

  return hasUserPatterns || hasUserResources || hasSpacePatterns || hasSpaceResources || hasAuthorizedUserId;
}

export function extractPermissions(permissions) {
  let permissionsResult = 0;

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

  return permissionsResult;
}

function prepareMessagePayloadVsp(_modules, { ttl, resources, patterns, meta, authorizedUserId }) {
  const params = {
    ttl: 0,
    permissions: {
      resources: {
        channels: {},
        groups: {},
        uuids: {},
        users: {}, // not used, needed for api backward compatibility
        spaces: {}, // not used, needed for api backward compatibility
      },
      patterns: {
        channels: {},
        groups: {},
        uuids: {},
        users: {}, // not used, needed for api backward compatibility
        spaces: {}, // not used, needed for api backward compatibility
      },
      meta: {},
    },
  };

  if (resources) {
    const { users, spaces, groups } = resources;

    if (users) {
      Object.keys(users).forEach((userID) => {
        params.permissions.resources.uuids[userID] = extractPermissions(users[userID]);
      });
    }

    if (spaces) {
      Object.keys(spaces).forEach((spaceId) => {
        params.permissions.resources.channels[spaceId] = extractPermissions(spaces[spaceId]);
      });
    }

    if (groups) {
      Object.keys(groups).forEach((group) => {
        params.permissions.resources.groups[group] = extractPermissions(groups[group]);
      });
    }
  }

  if (patterns) {
    const { users, spaces, groups } = patterns;

    if (users) {
      Object.keys(users).forEach((userId) => {
        params.permissions.patterns.uuids[userId] = extractPermissions(users[userId]);
      });
    }

    if (spaces) {
      Object.keys(spaces).forEach((spaceId) => {
        params.permissions.patterns.channels[spaceId] = extractPermissions(spaces[spaceId]);
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

  if (authorizedUserId) {
    params.permissions.uuid = `${authorizedUserId}`; // ensure this is a string
  }

  return params;
}

function prepareMessagePayload(_modules, incomingParams) {
  if (hasVspTerms(incomingParams)) {
    return prepareMessagePayloadVsp(_modules, incomingParams);
  }

  const { ttl, resources, patterns, meta, authorized_uuid } = incomingParams;

  const params = {
    ttl: 0,
    permissions: {
      resources: {
        channels: {},
        groups: {},
        uuids: {},
        users: {}, // not used, needed for api backward compatibility
        spaces: {}, // not used, needed for api backward compatibility
      },
      patterns: {
        channels: {},
        groups: {},
        uuids: {},
        users: {}, // not used, needed for api backward compatibility
        spaces: {}, // not used, needed for api backward compatibility
      },
      meta: {},
    },
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

export function validateParams(modules, incomingParams) {
  const { config } = modules;

  if (!config.subscribeKey) return 'Missing Subscribe Key';
  if (!config.publishKey) return 'Missing Publish Key';
  if (!config.secretKey) return 'Missing Secret Key';

  if (!incomingParams.resources && !incomingParams.patterns) return 'Missing either Resources or Patterns.';

  const hasAuthorizedUuid = incomingParams?.authorized_uuid !== undefined;
  const hasUuidResources = incomingParams?.resources?.uuids !== undefined;
  const hasChannelResources = incomingParams?.resources?.channels !== undefined;
  const hasGroupResources = incomingParams?.resources?.groups !== undefined;
  const hasUuidPatterns = incomingParams?.patterns?.uuids !== undefined;
  const hasChannelPatterns = incomingParams?.patterns?.channels !== undefined;
  const hasGroupPatterns = incomingParams?.patterns?.groups !== undefined;

  const hasLegacyTerms =
    hasAuthorizedUuid ||
    hasUuidResources ||
    hasUuidPatterns ||
    hasChannelResources ||
    hasChannelPatterns ||
    hasGroupResources ||
    hasGroupPatterns;

  if (hasVspTerms(incomingParams) && hasLegacyTerms) {
    return (
      'Cannot mix `users`, `spaces` and `authorizedUserId` ' +
      'with `uuids`, `channels`, `groups` and `authorized_uuid`'
    );
  }

  if (
    (incomingParams.resources &&
      (!incomingParams.resources.uuids || Object.keys(incomingParams.resources.uuids).length === 0) &&
      (!incomingParams.resources.channels || Object.keys(incomingParams.resources.channels).length === 0) &&
      (!incomingParams.resources.groups || Object.keys(incomingParams.resources.groups).length === 0) &&
      (!incomingParams.resources.users || Object.keys(incomingParams.resources.users).length === 0) &&
      (!incomingParams.resources.spaces || Object.keys(incomingParams.resources.spaces).length === 0)) ||
    (incomingParams.patterns &&
      (!incomingParams.patterns.uuids || Object.keys(incomingParams.patterns.uuids).length === 0) &&
      (!incomingParams.patterns.channels || Object.keys(incomingParams.patterns.channels).length === 0) &&
      (!incomingParams.patterns.groups || Object.keys(incomingParams.patterns.groups).length === 0) &&
      (!incomingParams.patterns.users || Object.keys(incomingParams.patterns.users).length === 0) &&
      (!incomingParams.patterns.spaces || Object.keys(incomingParams.patterns.spaces).length === 0))
  ) {
    return 'Missing values for either Resources or Patterns.';
  }
}

export function postURL(modules) {
  const { config } = modules;
  return `/v3/pam/${config.subscribeKey}/grant`;
}

export function usePost() {
  return true;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return false;
}

export function prepareParams() {
  return {};
}

export function postPayload(modules, incomingParams) {
  return prepareMessagePayload(modules, incomingParams);
}

export function handleResponse(modules, response) {
  const { token } = response.data;

  return token;
}
