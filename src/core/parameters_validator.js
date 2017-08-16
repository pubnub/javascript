const endpoints = {
  setup: {
    subscribeKey: 'string',
    publishKey: 'string',
    cipherKey: 'string',
    authKey: 'string',
    secretKey: 'string',
    logVerbosity: 'boolean',
    uuid: 'string',
    ssl: 'boolean',
    origin: 'string',
    presenceTimeout: 'number',
    heartbeatInterval: 'number',
    restore: 'boolean',
    keepAlive: 'boolean',
    keepAliveSettings: 'object',
    useInstanceId: 'boolean',
    sdkFamily: '*ignore',
    networking: '*ignore',
    db: '*ignore',
    customDecrypt: 'function',
    customEncrypt: 'function',
    partnerId: '*ignore',
    autoNetworkDetection: '*ignore',
    announceSuccessfulHeartbeats: '*ignore',
    requestMessageCountThreshold: '*ignore',
    filterExpression: '*ignore',
    removeAllListeners: '*ignore'
  },
  publish: {
    message: 'object',
    channel: 'string',
    storeInHistory: 'boolean',
    sendByPost: 'boolean',
    meta: 'object',
    ttl: 'number',
    callback: 'function',
    replicate: '*ignore'
  },
  fire: {
    message: 'object',
    channel: 'string',
    sendByPost: 'boolean',
    meta: 'object',
    callback: 'function',
    replicate: '*ignore'
  },
  subscribe: {
    channels: 'array',
    channelGroups: 'array',
    withPresence: 'boolean',
    timetoken: 'object',
    filterExpression: '*ignore',
    region: '*ignore'
  },
  unsubscribe: {
    channels: 'array',
    channelGroups: 'array'
  },
  here_now: {
    channels: 'array',
    channelGroups: 'array',
    includeUUIDs: 'boolean',
    includeState: 'boolean',
    callback: 'function'
  },
  where_now: {
    uuid: 'string',
    callback: 'function'
  },
  set_state: {
    channels: 'array',
    channelGroups: 'array',
    state: 'object',
    callback: 'function'
  },
  get_state: {
    uuid: 'string',
    channels: 'array',
    channelGroups: 'array',
    callback: 'function'
  },
  grant: {
    channels: 'array',
    channelGroups: 'array',
    authKeys: 'array',
    ttl: 'number',
    read: 'boolean',
    write: 'boolean',
    manage: 'boolean',
    callback: 'function'
  },
  add_channels: {
    channels: 'array',
    channelGroup: 'string',
    callback: 'function'
  },
  list_channels: {
    channelGroup: 'string',
    callback: 'function'
  },
  remove_channels: {
    channels: 'array',
    channelGroup: 'string',
    callback: 'function'
  },
  delete_group: {
    channelGroup: 'string',
    callback: 'function'
  },
  history: {
    channel: 'string',
    reverse: 'boolean',
    count: 'number',
    stringifiedTimeToken: 'boolean',
    start: 'string',
    end: 'string',
    callback: 'function'
  },
  fetch_messages: {
    channels: 'array',
    count: 'number',
    start: 'string',
    end: 'string',
    callback: 'function'
  },
  add_push_channels: {
    channels: 'array',
    device: 'string',
    pushGateway: 'string',
    callback: 'function'
  },
  list_push_channels: {
    device: 'string',
    pushGateway: 'string',
    callback: 'function'
  },
  remove_push_channels: {
    channels: 'array',
    device: 'string',
    pushGateway: 'string',
    callback: 'function',
    uuid: '*ignore'
  },
  remove_device: {
    device: 'string',
    pushGateway: 'string',
    callback: 'function'
  }
};

export default function (endpointName, incomingParams) {
  let result;

  Object.keys(incomingParams).forEach((key) => {
    const expected = endpoints[endpointName][key];
    const received = typeof incomingParams[key];

    if (!expected) {
      result = `The param: (${key}) is not valid!`;
      return;
    } else if (expected === '*ignore') {
      return;
    } else if (expected === 'array' && Array.isArray(incomingParams[key])) {
      return;
    } else if (expected === 'object') {
      return;
    } else if (received !== expected) {
      result = `The type expected for the param (${key}) has to be ${expected} but was received ${received}`;
      return;
    }
  });

  return result;
}
