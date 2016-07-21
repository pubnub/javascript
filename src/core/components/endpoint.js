import { StatusAnnouncement } from '../flow_interfaces';
import uuidGenerator from 'uuid';
import utils from '../utils';

function createError(errorPayload: Object, type: string): Object {
  errorPayload.type = type;
  return errorPayload;
}

function createValidationError(message: string): Object {
  return createError({ message }, 'validationError');
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

  Object.keys(config.baseParams).forEach((key) => {
    let value = config.baseParams[key];
    if (!(key in outgoingParams)) outgoingParams[key] = value;
  });

  if (config.useInstanceId) {
    outgoingParams.instanceid = config.instanceId;
  }

  if (config.useRequestId) {
    outgoingParams.requestid = uuidGenerator.v4();
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
    if (status.error) return callback(status);

    callback(status, endpoint.handleResponse(modules, payload, incomingParams));
  };

  let callInstance;

  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    let url = endpoint.postURL(modules, incomingParams);
    let payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, { url, operation: endpoint.getOperation() }, onResponse);
  } else {
    let url = endpoint.getURL(modules, incomingParams);
    callInstance = networking.GET(outgoingParams, { url, operation: endpoint.getOperation() }, onResponse);
  }

  if (endpoint.getOperation === 'PNSubscribeOperation') {
    return callInstance;
  }
}
