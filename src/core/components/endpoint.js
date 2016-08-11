import { StatusAnnouncement } from '../flow_interfaces';
import uuidGenerator from 'uuid';
import utils from '../utils';
import Config from './config';

function createError(errorPayload: Object, type: string): Object {
  errorPayload.type = type;
  return errorPayload;
}

function createValidationError(message: string): Object {
  return createError({ message }, 'validationError');
}

function generatePNSDK(config: Config): string {
  let base = 'PubNub-JS-' + config.sdkFamily;

  if (config.partnerId) {
    base += '-' + config.partnerId;
  }

  base += '/' + config.getVersion();

  return base;
}

export default function (modules, endpoint, ...args) {
  let { networking, config, crypto } = modules;
  let callback = null;
  let incomingParams = {};

  if (endpoint.getOperation() === 'PNTimeOperation' || endpoint.getOperation() === 'PNChannelGroupsOperation') {
    callback = args[0];
  } else {
    incomingParams = args[0];
    callback = args[1];
  }

  let validationResult = endpoint.validateParams(modules, incomingParams);

  if (validationResult) {
    callback(createValidationError(validationResult));
    return;
  }

  let outgoingParams = endpoint.prepareParams(modules, incomingParams);

  outgoingParams.uuid = config.UUID;
  outgoingParams.pnsdk = generatePNSDK(config);

  if (config.useInstanceId) {
    outgoingParams.instanceid = config.instanceId;
  }

  if (config.useRequestId) {
    outgoingParams.requestid = uuidGenerator.v4();
  }

  if (endpoint.isAuthSupported() && config.getAuthKey()) {
    outgoingParams.auth = config.getAuthKey();
  }

  // encrypt the params
  if (endpoint.getOperation() === 'PNAccessManagerGrant') {
    let signInput = config.subscribeKey + '\n' + config.publishKey + '\ngrant\n';
    signInput += utils.signPamFromParams(outgoingParams);
    outgoingParams.signature = crypto.HMACSHA256(signInput);
  }

  if (endpoint.getOperation() === 'PNAccessManagerAudit') {
    let signInput = config.subscribeKey + '\n' + config.publishKey + '\naudit\n';
    signInput += utils.signPamFromParams(outgoingParams);
    outgoingParams.signature = crypto.HMACSHA256(signInput);
  }

  let onResponse = (status: StatusAnnouncement, payload: Object) => {
    if (callback) {
      if (status.error) return callback(status);

      callback(status, endpoint.handleResponse(modules, payload, incomingParams));
    }
  };

  let callInstance;

  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    let url = endpoint.postURL(modules, incomingParams);
    let networkingParams = { url,
      operation: endpoint.getOperation(),
      timeout: endpoint.getRequestTimeout(modules)
    };
    let payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
  } else {
    let url = endpoint.getURL(modules, incomingParams);
    let networkingParams = { url,
      operation: endpoint.getOperation(),
      timeout: endpoint.getRequestTimeout(modules)
    };
    callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
  }

  if (endpoint.getOperation() === 'PNSubscribeOperation') {
    return callInstance;
  }
}
