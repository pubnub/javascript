import uuidGenerator from './uuid';
import { StatusAnnouncement } from '../flow_interfaces';
import utils from '../utils';
import Config from './config';
import operationConstants from '../constants/operations';
import categoryConstants from '../constants/categories';

export class PubNubError extends Error {
  constructor(message, status) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.message = message;
  }
}

function createError(errorPayload: Object, type: string): Object {
  errorPayload.type = type;
  errorPayload.error = true;
  return errorPayload;
}

export function createValidationError(message: string): Object {
  return createError({ message }, 'validationError');
}

function decideURL(endpoint, modules, incomingParams) {
  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    return endpoint.postURL(modules, incomingParams);
  } else if (endpoint.usePatch && endpoint.usePatch(modules, incomingParams)) {
    return endpoint.patchURL(modules, incomingParams);
  } else if (endpoint.useGetFile && endpoint.useGetFile(modules, incomingParams)) {
    return endpoint.getFileURL(modules, incomingParams);
  } else {
    return endpoint.getURL(modules, incomingParams);
  }
}

export function generatePNSDK(config: Config): string {
  if (config.sdkName) {
    return config.sdkName;
  }

  let base = `PubNub-JS-${config.sdkFamily}`;

  if (config.partnerId) {
    base += `-${config.partnerId}`;
  }

  base += `/${config.getVersion()}`;

  let pnsdkSuffix = config._getPnsdkSuffix(' ');

  if (pnsdkSuffix.length > 0) {
    base += pnsdkSuffix;
  }

  return base;
}

function getHttpMethod(modules, endpoint, incomingParams) {
  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    return 'POST';
  } else if (endpoint.usePatch && endpoint.usePatch(modules, incomingParams)) {
    return 'PATCH';
  } else if (endpoint.useDelete && endpoint.useDelete(modules, incomingParams)) {
    return 'DELETE';
  } else if (endpoint.useGetFile && endpoint.useGetFile(modules, incomingParams)) {
    return 'GETFILE';
  } else {
    return 'GET';
  }
}

export function signRequest(modules, url, outgoingParams, incomingParams, endpoint) {
  let { config, crypto } = modules;

  let httpMethod = getHttpMethod(modules, endpoint, incomingParams);

  outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);

  // This is because of a server-side bug, old publish using post should be deprecated
  if (endpoint.getOperation() === 'PNPublishOperation' && endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    httpMethod = 'GET';
  }

  if (httpMethod === 'GETFILE') {
    httpMethod = 'GET';
  }

  let signInput = `${httpMethod}\n${config.publishKey}\n${url}\n${utils.signPamFromParams(outgoingParams)}\n`;

  if (httpMethod === 'POST') {
    let payload = endpoint.postPayload(modules, incomingParams);
    if (typeof payload === 'string') {
      signInput += payload;
    } else {
      signInput += JSON.stringify(payload);
    }
  } else if (httpMethod === 'PATCH') {
    let payload = endpoint.patchPayload(modules, incomingParams);
    if (typeof payload === 'string') {
      signInput += payload;
    } else {
      signInput += JSON.stringify(payload);
    }
  }

  let signature = `v2.${crypto.HMACSHA256(signInput)}`;
  signature = signature.replace(/\+/g, '-');
  signature = signature.replace(/\//g, '_');
  signature = signature.replace(/=+$/, '');

  outgoingParams.signature = signature;
}

export default function (modules, endpoint, ...args) {
  let { networking, config, telemetryManager, tokenManager } = modules;
  const requestId = uuidGenerator.createUUID();
  let callback = null;
  let promiseComponent = null;
  let incomingParams = {};

  if (
    endpoint.getOperation() === operationConstants.PNTimeOperation ||
    endpoint.getOperation() === operationConstants.PNChannelGroupsOperation
  ) {
    callback = args[0];
  } else {
    incomingParams = args[0];
    callback = args[1];
  }

  // bridge in Promise support.
  if (typeof Promise !== 'undefined' && !callback) {
    promiseComponent = utils.createPromise();
  }

  let validationResult = endpoint.validateParams(modules, incomingParams);

  if (validationResult) {
    if (callback) {
      return callback(createValidationError(validationResult));
    } else if (promiseComponent) {
      promiseComponent.reject(
        new PubNubError('Validation failed, check status for details', createValidationError(validationResult))
      );
      return promiseComponent.promise;
    }
    return;
  }

  let outgoingParams = endpoint.prepareParams(modules, incomingParams);
  let url = decideURL(endpoint, modules, incomingParams);
  let callInstance;
  let networkingParams = {
    url,
    operation: endpoint.getOperation(),
    timeout: endpoint.getRequestTimeout(modules),
    headers: endpoint.getRequestHeaders ? endpoint.getRequestHeaders() : {},
    ignoreBody: typeof endpoint.ignoreBody === 'function' ? endpoint.ignoreBody(modules) : false,
    forceBuffered:
      typeof endpoint.forceBuffered === 'function' ? endpoint.forceBuffered(modules, incomingParams) : null,
  };

  outgoingParams.uuid = config.UUID;
  outgoingParams.pnsdk = generatePNSDK(config);

  // Add telemetry information (if there is any available).
  const telemetryLatencies = telemetryManager.operationsLatencyForRequest();
  if (Object.keys(telemetryLatencies).length) {
    outgoingParams = { ...outgoingParams, ...telemetryLatencies };
  }

  if (config.useInstanceId) {
    outgoingParams.instanceid = config.instanceId;
  }

  if (config.useRequestId) {
    outgoingParams.requestid = requestId;
  }

  if (endpoint.isAuthSupported()) {
    let tokenOrKey = tokenManager.getToken() || config.getAuthKey();

    if (tokenOrKey) {
      outgoingParams.auth = tokenOrKey;
    }
  }

  if (config.secretKey) {
    signRequest(modules, url, outgoingParams, incomingParams, endpoint);
  }

  let onResponse = (status: StatusAnnouncement, payload: Object) => {
    if (status.error) {
      if (endpoint.handleError) {
        endpoint.handleError(modules, incomingParams, status);
      }
      if (callback) {
        callback(status);
      } else if (promiseComponent) {
        promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', status));
      }
      return;
    }

    // Stop endpoint latency tracking.
    telemetryManager.stopLatencyMeasure(endpoint.getOperation(), requestId);

    let responseP = endpoint.handleResponse(modules, payload, incomingParams);

    if (typeof responseP?.then !== 'function') {
      responseP = Promise.resolve(responseP);
    }

    responseP
      .then((result) => {
        if (callback) {
          callback(status, result);
        } else if (promiseComponent) {
          promiseComponent.fulfill(result);
        }
      })
      .catch((e) => {
        if (callback) {
          let errorData = e;

          if (endpoint.getOperation() === operationConstants.PNSubscribeOperation) {
            errorData = {
              statusCode: 400,
              error: true,
              operation: endpoint.getOperation(),
              errorData: e,
              category: categoryConstants.PNUnknownCategory
            };
          }

          callback(errorData, null);
        } else if (promiseComponent) {
          promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', e));
        }
      });
  };

  // Start endpoint latency tracking.
  telemetryManager.startLatencyMeasure(endpoint.getOperation(), requestId);

  if (getHttpMethod(modules, endpoint, incomingParams) === 'POST') {
    let payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
  } else if (getHttpMethod(modules, endpoint, incomingParams) === 'PATCH') {
    let payload = endpoint.patchPayload(modules, incomingParams);
    callInstance = networking.PATCH(outgoingParams, payload, networkingParams, onResponse);
  } else if (getHttpMethod(modules, endpoint, incomingParams) === 'DELETE') {
    callInstance = networking.DELETE(outgoingParams, networkingParams, onResponse);
  } else if (getHttpMethod(modules, endpoint, incomingParams) === 'GETFILE') {
    callInstance = networking.GETFILE(outgoingParams, networkingParams, onResponse);
  } else {
    callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
  }

  if (endpoint.getOperation() === operationConstants.PNSubscribeOperation) {
    return callInstance;
  }

  if (promiseComponent) {
    return promiseComponent.promise;
  }
}
