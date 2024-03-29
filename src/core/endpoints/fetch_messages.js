/*       */
import operationConstants from '../constants/operations';
import utils from '../utils';

function __processMessage(modules, message) {
  const result = {};
  if (!modules.cryptoModule) {
    result.payload = message;
    return result;
  }
  try {
    const decryptedData = modules.cryptoModule.decrypt(message);
    const decryptedPayload =
      decryptedData instanceof ArrayBuffer ? JSON.parse(new TextDecoder().decode(decryptedData)) : decryptedData;
    result.payload = decryptedPayload;
    return result;
  } catch (e) {
    if (modules.config.logVerbosity && console && console.log) console.log('decryption error', e.message);
    result.payload = message;
    result.error = `Error while decrypting message content: ${e.message}`;
  }
  return result;
}

export function getOperation() {
  return operationConstants.PNFetchMessagesOperation;
}

export function validateParams(modules, incomingParams) {
  const { channels, includeMessageActions = false } = incomingParams;
  const { config } = modules;

  if (!channels || channels.length === 0) return 'Missing channels';
  if (!config.subscribeKey) return 'Missing Subscribe Key';

  if (includeMessageActions && channels.length > 1) {
    throw new TypeError(
      'History can return actions data for a single channel only. ' +
        'Either pass a single channel or disable the includeMessageActions flag.',
    );
  }
}

export function getURL(modules, incomingParams) {
  const { channels = [], includeMessageActions = false } = incomingParams;
  const { config } = modules;
  const endpoint = !includeMessageActions ? 'history' : 'history-with-actions';

  const stringifiedChannels = channels.length > 0 ? channels.join(',') : ',';
  return `/v3/${endpoint}/sub-key/${config.subscribeKey}/channel/${utils.encodeString(stringifiedChannels)}`;
}

export function getRequestTimeout({ config }) {
  return config.getTransactionTimeout();
}

export function isAuthSupported() {
  return true;
}

export function prepareParams(modules, incomingParams) {
  const {
    channels,
    start,
    end,
    includeMessageActions,
    count,
    stringifiedTimeToken = false,
    includeMeta = false,
    includeUuid,
    includeUUID = true,
    includeMessageType = true,
  } = incomingParams;
  const outgoingParams = {};

  if (count) {
    outgoingParams.max = count;
  } else {
    outgoingParams.max = channels.length > 1 || includeMessageActions === true ? 25 : 100;
  }
  if (start) outgoingParams.start = start;
  if (end) outgoingParams.end = end;
  if (stringifiedTimeToken) outgoingParams.string_message_token = 'true';
  if (includeMeta) outgoingParams.include_meta = 'true';
  if (includeUUID && includeUuid !== false) outgoingParams.include_uuid = 'true';
  if (includeMessageType) outgoingParams.include_message_type = 'true';

  return outgoingParams;
}

export function handleResponse(modules, serverResponse) {
  const response = {
    channels: {},
  };

  Object.keys(serverResponse.channels || {}).forEach((channelName) => {
    response.channels[channelName] = [];

    (serverResponse.channels[channelName] || []).forEach((messageEnvelope) => {
      const announce = {};
      const processedMessgeResult = __processMessage(modules, messageEnvelope.message);
      announce.channel = channelName;
      announce.timetoken = messageEnvelope.timetoken;
      announce.message = processedMessgeResult.payload;
      announce.messageType = messageEnvelope.message_type;
      announce.uuid = messageEnvelope.uuid;

      if (messageEnvelope.actions) {
        announce.actions = messageEnvelope.actions;

        // This should be kept for few updates for existing clients consistency.
        announce.data = messageEnvelope.actions;
      }
      if (messageEnvelope.meta) {
        announce.meta = messageEnvelope.meta;
      }
      if (processedMessgeResult.error) announce.error = processedMessgeResult.error;

      response.channels[channelName].push(announce);
    });
  });
  if (serverResponse.more) {
    response.more = serverResponse.more;
  }

  return response;
}
