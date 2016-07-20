import { StatusAnnouncement } from '../flow_interfaces';
import uuidGenerator from 'uuid';

function createError(errorPayload: Object, type: string): Object {
  errorPayload.type = type;
  return errorPayload;
}

function createValidationError(message: string): Object {
  return createError({ message }, 'validationError');
}

export default function (modules, endpoint, ...args) {
  let { networking, config } = modules;
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

  let onResponse = (status: StatusAnnouncement, payload: Object) => {
    if (status.error) return callback(status);

    callback(status, endpoint.handleResponse(modules, payload));
  };

  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    let url = endpoint.postURL(modules, incomingParams);
    let payload = endpoint.postPayload(modules, incomingParams);
    networking.POST(outgoingParams, payload, { url }, onResponse);
  } else {
    let url = endpoint.getURL(modules, incomingParams);
    networking.GET(outgoingParams, { url }, onResponse);
  }
}
