import uuidGenerator from 'uuid';

import { StatusAnnouncement } from '../flow_interfaces';
import utils from '../utils';
import Config from './config';
import operationConstants from '../constants/operations';

function createError(errorPayload: Object, type: string): Object {
  errorPayload.type = type;
  return errorPayload;
}

function createValidationError(message: string): Object {
  return createError({ message }, 'validationError');
}

function decideURL(endpoint, modules, incomingParams) {
  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    return endpoint.postURL(modules, incomingParams);
  } else {
    return endpoint.getURL(modules, incomingParams);
  }
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

  if (endpoint.getOperation() === operationConstants.PNTimeOperation || endpoint.getOperation() === operationConstants.PNChannelGroupsOperation) {
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

  if (config.secretKey) {
    outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);
    let signInput = config.subscribeKey + '\n' + config.publishKey + '\n';

    if (endpoint.getOperation() === operationConstants.PNAccessManagerGrant) {
      signInput += 'grant\n';
    } else if (endpoint.getOperation() === operationConstants.PNAccessManagerAudit) {
      signInput += 'audit\n';
    } else {
      signInput += decideURL(endpoint, modules, incomingParams) + '\n';
    }

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
  let url = decideURL(endpoint, modules, incomingParams);
  let networkingParams = { url,
    operation: endpoint.getOperation(),
    timeout: endpoint.getRequestTimeout(modules)
  };

  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    let payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
  } else {
    callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
  }

  if (endpoint.getOperation() === operationConstants.PNSubscribeOperation) {
    return callInstance;
  }
}
