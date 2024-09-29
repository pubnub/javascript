(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise, SuppressedError, Symbol */


    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function getDefaultExportFromCjs (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    var uuid = {exports: {}};

    /*! lil-uuid - v0.1 - MIT License - https://github.com/lil-js/uuid */
    uuid.exports;

    (function (module, exports) {
    	(function (root, factory) {
    	  {
    	    factory(exports);
    	    if (module !== null) {
    	      module.exports = exports.uuid;
    	    }
    	  }
    	}(commonjsGlobal, function (exports) {
    	  var VERSION = '0.1.0';
    	  var uuidRegex = {
    	    '3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
    	    '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    	    '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    	    all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    	  };

    	  function uuid() {
    	    var uuid = '', i, random;
    	    for (i = 0; i < 32; i++) {
    	      random = Math.random() * 16 | 0;
    	      if (i === 8 || i === 12 || i === 16 || i === 20) uuid += '-';
    	      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    	    }
    	    return uuid
    	  }

    	  function isUUID(str, version) {
    	    var pattern = uuidRegex[version || 'all'];
    	    return pattern && pattern.test(str) || false
    	  }

    	  uuid.isUUID = isUUID;
    	  uuid.VERSION = VERSION;

    	  exports.uuid = uuid;
    	  exports.isUUID = isUUID;
    	})); 
    } (uuid, uuid.exports));

    var uuidExports = uuid.exports;
    var uuidGenerator$1 = /*@__PURE__*/getDefaultExportFromCjs(uuidExports);

    var uuidGenerator = {
        createUUID() {
            if (uuidGenerator$1.uuid) {
                return uuidGenerator$1.uuid();
            }
            // @ts-expect-error Depending on module type it may be callable.
            return uuidGenerator$1();
        },
    };

    /// <reference lib="webworker" />
    /**
     * Subscription Service Worker Transport provider.
     *
     * Service worker provides support for PubNub subscription feature to give better user experience across
     * multiple opened pages.
     */
    /**
     * How often PING request should be sent to the PubNub clients.
     */
    const clientPingRequestInterval = 10000;
    /**
     * Aggregation timer timeout.
     *
     * Timeout used by the timer to postpone `handleSendSubscribeRequestEvent` function call and let other clients for
     * same subscribe key send next subscribe loop request (to make aggregation more efficient).
     */
    const subscribeAggregationTimeout = 50;
    /**
     * Map of PubNub client subscription keys to the started aggregation timeout timers.
     */
    const aggregationTimers = new Map();
    // region State
    /**
     * Service `ArrayBuffer` response decoder.
     */
    const decoder = new TextDecoder();
    /**
     * Whether `Subscription` worker should print debug information to the console or not.
     */
    let logVerbosity = false;
    /**
     * PubNub clients active ping interval.
     */
    let pingInterval;
    /**
     * Unique shared worker instance identifier.
     */
    const sharedWorkerIdentifier = uuidGenerator.createUUID();
    /**
     * Map of identifiers, scheduled by the Service Worker, to their abort controllers.
     *
     * **Note:** Because of message-based nature of interaction it will be impossible to pass actual {@link AbortController}
     * to the transport provider code.
     */
    const abortControllers = new Map();
    /**
     * Map of PubNub client identifiers to their state in the current Service Worker.
     */
    const pubNubClients = {};
    /**
     * Per-subscription key list of PubNub client state.
     */
    const pubNubClientsBySubscriptionKey = {};
    /**
     * Per-subscription key presence state associated with unique user identifiers with which {@link pubNubClients|clients}
     * scheduled subscription request.
     */
    const presenceState = {};
    /**
     * Per-subscription key map of client identifiers to the Shared Worker {@link MessagePort}.
     *
     * Shared Worker {@link MessagePort} represent specific PubNub client which connected to the Shared Worker.
     */
    const sharedWorkerClients = {};
    /**
     * List of ongoing subscription requests.
     *
     * **Node:** Identifiers differ from request identifiers received in {@link SendRequestEvent} object.
     */
    const serviceRequests = {};
    // endregion
    // --------------------------------------------------------
    // ------------------- Event Handlers ---------------------
    // --------------------------------------------------------
    // region Event Handlers
    /**
     * Handle new PubNub client 'connection'.
     *
     * Echo listeners to let `SharedWorker` users that it is ready.
     *
     * @param event - Remote `SharedWorker` client connection event.
     */
    self.onconnect = (event) => {
        consoleLog('New PubNub Client connected to the Subscription Shared Worker.');
        event.ports.forEach((receiver) => {
            receiver.start();
            receiver.onmessage = (event) => {
                // Ignoring unknown event payloads.
                if (!validateEventPayload(event))
                    return;
                const data = event.data;
                if (data.type === 'client-register') {
                    if (!logVerbosity && data.workerLogVerbosity)
                        logVerbosity = true;
                    // Appending information about messaging port for responses.
                    data.port = receiver;
                    registerClientIfRequired(data);
                    consoleLog(`Client '${data.clientIdentifier}' registered with '${sharedWorkerIdentifier}' shared worker`);
                }
                else if (data.type === 'client-pong')
                    handleClientPong(data);
                else if (data.type === 'send-request') {
                    if (data.request.path.startsWith('/v2/subscribe')) {
                        updateClientStateIfRequired(data);
                        const client = pubNubClients[data.clientIdentifier];
                        if (client) {
                            const timerIdentifier = `${client.userId}-${client.subscriptionKey}`;
                            // Check whether we need to start new aggregation timer or not.
                            if (!aggregationTimers.has(timerIdentifier)) {
                                const aggregationTimer = setTimeout(() => {
                                    handleSendSubscribeRequestEvent(data);
                                    aggregationTimers.delete(timerIdentifier);
                                }, subscribeAggregationTimeout);
                                aggregationTimers.set(timerIdentifier, aggregationTimer);
                            }
                        }
                    }
                    else
                        handleSendLeaveRequestEvent(data);
                }
                else if (data.type === 'cancel-request')
                    handleCancelRequestEvent(data);
            };
            receiver.postMessage({ type: 'shared-worker-connected' });
        });
    };
    /**
     * Handle client request to send subscription request.
     *
     * @param event - Subscription event details.
     */
    const handleSendSubscribeRequestEvent = (event) => {
        var _a;
        const requestOrId = subscribeTransportRequestFromEvent(event);
        const client = pubNubClients[event.clientIdentifier];
        let isInitialSubscribe = false;
        if (client) {
            if (client.subscription)
                isInitialSubscribe = client.subscription.timetoken === '0';
            notifyRequestProcessing('start', [client], new Date().toISOString());
        }
        if (typeof requestOrId === 'string') {
            const scheduledRequest = serviceRequests[requestOrId];
            if (client) {
                if (client.subscription) {
                    // Updating client timetoken information.
                    client.subscription.timetoken = scheduledRequest.timetoken;
                    client.subscription.region = scheduledRequest.region;
                    client.subscription.serviceRequestId = requestOrId;
                }
                if (!isInitialSubscribe)
                    return;
                const body = new TextEncoder().encode(`{"t":{"t":"${scheduledRequest.timetoken}","r":${(_a = scheduledRequest.region) !== null && _a !== void 0 ? _a : '0'}},"m":[]}`);
                const headers = new Headers({
                    'Content-Type': 'text/javascript; charset="UTF-8"',
                    'Content-Length': `${body.length}`,
                });
                const response = new Response(body, { status: 200, headers });
                const result = requestProcessingSuccess([response, body]);
                result.url = `${event.request.origin}${event.request.path}`;
                result.clientIdentifier = event.clientIdentifier;
                result.identifier = event.request.identifier;
                notifyRequestProcessing('end', [client], new Date().toISOString(), event.request, body, headers.get('Content-Type'), 0);
                publishClientEvent(client, result);
            }
            return;
        }
        if (event.request.cancellable)
            abortControllers.set(requestOrId.identifier, new AbortController());
        const scheduledRequest = serviceRequests[requestOrId.identifier];
        const { timetokenOverride, regionOverride } = scheduledRequest;
        sendRequest(requestOrId, () => clientsForRequest(requestOrId.identifier), (clients, response) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, response);
            // Clean up scheduled request and client references to it.
            markRequestCompleted(clients, requestOrId.identifier);
        }, (clients, error) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, null, requestOrId, requestProcessingError(error));
            // Clean up scheduled request and client references to it.
            markRequestCompleted(clients, requestOrId.identifier);
        }, (response) => {
            let serverResponse = response;
            if (isInitialSubscribe && timetokenOverride && timetokenOverride !== '0') {
                serviceRequests[requestOrId.identifier];
                serverResponse = patchInitialSubscribeResponse(serverResponse, timetokenOverride, regionOverride);
            }
            return serverResponse;
        });
        consoleLog(`'${Object.keys(serviceRequests).length}' subscription request currently active.`);
    };
    const patchInitialSubscribeResponse = (serverResponse, timetoken, region) => {
        if (timetoken === undefined || timetoken === '0' || serverResponse[0].status >= 400) {
            return serverResponse;
        }
        let json;
        const response = serverResponse[0];
        let decidedResponse = response;
        let body = serverResponse[1];
        try {
            json = JSON.parse(new TextDecoder().decode(body));
        }
        catch (error) {
            consoleLog(`Subscribe response parse error: ${error}`);
            return serverResponse;
        }
        // Replace server-provided timetoken.
        json.t.t = timetoken;
        if (region)
            json.t.r = parseInt(region, 10);
        try {
            body = new TextEncoder().encode(JSON.stringify(json)).buffer;
            if (body.byteLength) {
                const headers = new Headers(response.headers);
                headers.set('Content-Length', `${body.byteLength}`);
                // Create a new response with the original response options and modified headers
                decidedResponse = new Response(body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: headers,
                });
            }
        }
        catch (error) {
            consoleLog(`Subscribe serialization error: ${error}`);
            return serverResponse;
        }
        return body.byteLength > 0 ? [decidedResponse, body] : serverResponse;
    };
    /**
     * Handle client request to leave request.
     *
     * @param data - Leave event details.
     */
    const handleSendLeaveRequestEvent = (data) => {
        const client = pubNubClients[data.clientIdentifier];
        const request = leaveTransportRequestFromEvent(data);
        if (!client)
            return;
        // Clean up client subscription information if there is no more channels / groups to use.
        const { subscription } = client;
        const serviceRequestId = subscription === null || subscription === void 0 ? void 0 : subscription.serviceRequestId;
        if (subscription) {
            if (subscription.channels.length === 0 && subscription.channelGroups.length === 0) {
                subscription.channelGroupQuery = '';
                subscription.path = '';
                subscription.previousTimetoken = '0';
                subscription.timetoken = '0';
                delete subscription.region;
                delete subscription.serviceRequestId;
                delete subscription.request;
            }
        }
        if (!request) {
            const body = new TextEncoder().encode('{"status": 200, "action": "leave", "message": "OK", "service":"Presence"}');
            const headers = new Headers({
                'Content-Type': 'text/javascript; charset="UTF-8"',
                'Content-Length': `${body.length}`,
            });
            const response = new Response(body, { status: 200, headers });
            const result = requestProcessingSuccess([response, body]);
            result.url = `${data.request.origin}${data.request.path}`;
            result.clientIdentifier = data.clientIdentifier;
            result.identifier = data.request.identifier;
            publishClientEvent(client, result);
            return;
        }
        sendRequest(request, () => [client], (clients, response) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, response, data.request);
        }, (clients, error) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, null, data.request, requestProcessingError(error));
        });
        consoleLog(`Started leave request.`, client);
        // Check whether there were active subscription with channels from this client or not.
        if (serviceRequestId === undefined)
            return;
        // Update ongoing clients
        const clients = clientsForRequest(serviceRequestId);
        clients.forEach((client) => {
            if (client && client.subscription)
                delete client.subscription.serviceRequestId;
        });
        cancelRequest(serviceRequestId);
        restartSubscribeRequestForClients(clients);
    };
    /**
     * Handle cancel request event.
     *
     * Try cancel request if there is no other observers.
     *
     * @param event - Request cancellation event details.
     */
    const handleCancelRequestEvent = (event) => {
        const client = pubNubClients[event.clientIdentifier];
        if (!client || !client.subscription)
            return;
        const serviceRequestId = client.subscription.serviceRequestId;
        if (!client || !serviceRequestId)
            return;
        // Unset awaited requests.
        delete client.subscription.serviceRequestId;
        if (client.subscription.request && client.subscription.request.identifier === event.identifier) {
            delete client.subscription.request;
        }
        cancelRequest(serviceRequestId);
    };
    // endregion
    // --------------------------------------------------------
    // --------------------- Subscription ---------------------
    // --------------------------------------------------------
    // region Subscription
    /**
     * Try restart subscribe request for the list of clients.
     *
     * Subscribe restart will use previous timetoken information to schedule new subscription loop.
     *
     * **Note:** This function mimics behaviour when SharedWorker receives request from PubNub SDK.
     *
     * @param clients List of PubNub client states for which new aggregated request should be sent.
     */
    const restartSubscribeRequestForClients = (clients) => {
        let clientWithRequest;
        let request;
        for (const client of clients) {
            if (client.subscription && client.subscription.request) {
                request = client.subscription.request;
                clientWithRequest = client;
                break;
            }
        }
        if (!request || !clientWithRequest)
            return;
        handleSendSubscribeRequestEvent({
            type: 'send-request',
            clientIdentifier: clientWithRequest.clientIdentifier,
            subscriptionKey: clientWithRequest.subscriptionKey,
            logVerbosity: clientWithRequest.logVerbosity,
            request,
        });
    };
    // endregion
    // --------------------------------------------------------
    // ------------------------ Common ------------------------
    // --------------------------------------------------------
    // region Common
    /**
     * Process transport request.
     *
     * @param request - Transport request with required information for {@link Request} creation.
     * @param getClients - Request completion PubNub client observers getter.
     * @param success - Request success completion handler.
     * @param failure - Request failure handler.
     * @param responsePreProcess - Raw response pre-processing function which is used before calling handling callbacks.
     */
    const sendRequest = (request, getClients, success, failure, responsePreProcess) => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Request progress support.
            const start = new Date().getTime();
            Promise.race([
                fetch(requestFromTransportRequest(request), {
                    signal: (_a = abortControllers.get(request.identifier)) === null || _a === void 0 ? void 0 : _a.signal,
                    keepalive: true,
                }),
                requestTimeoutTimer(request.identifier, request.timeout),
            ])
                .then((response) => response.arrayBuffer().then((buffer) => [response, buffer]))
                .then((response) => (responsePreProcess ? responsePreProcess(response) : response))
                .then((response) => {
                const responseBody = response[1].byteLength > 0 ? response[1] : undefined;
                const clients = getClients();
                if (clients.length === 0)
                    return;
                notifyRequestProcessing('end', clients, new Date().toISOString(), request, responseBody, response[0].headers.get('Content-Type'), new Date().getTime() - start);
                success(clients, response);
            })
                .catch((error) => {
                const clients = getClients();
                if (clients.length === 0)
                    return;
                failure(clients, error);
            });
        }))();
    };
    /**
     * Cancel (abort) service request by ID.
     *
     * @param requestId - Unique identifier of request which should be cancelled.
     */
    const cancelRequest = (requestId) => {
        if (clientsForRequest(requestId).length === 0) {
            const controller = abortControllers.get(requestId);
            abortControllers.delete(requestId);
            // Clean up scheduled requests.
            delete serviceRequests[requestId];
            // Abort request if possible.
            if (controller)
                controller.abort();
        }
    };
    /**
     * Create request timeout timer.
     *
     * **Note:** Native Fetch API doesn't support `timeout` out-of-box and {@link Promise} used to emulate it.
     *
     * @param requestId - Unique identifier of request which will time out after {@link requestTimeout} seconds.
     * @param requestTimeout - Number of seconds after which request with specified identifier will time out.
     *
     * @returns Promise which rejects after time out will fire.
     */
    const requestTimeoutTimer = (requestId, requestTimeout) => new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
            // Clean up.
            abortControllers.delete(requestId);
            clearTimeout(timeoutId);
            reject(new Error('Request timeout'));
        }, requestTimeout * 1000);
    });
    /**
     * Retrieve list of PubNub clients which is pending for service worker request completion.
     *
     * @param identifier - Identifier of the subscription request which has been scheduled by the Service Worker.
     *
     * @returns List of PubNub client state objects for Service Worker.
     */
    const clientsForRequest = (identifier) => {
        return Object.values(pubNubClients).filter((client) => client !== undefined && client.subscription !== undefined && client.subscription.serviceRequestId === identifier);
    };
    /**
     * Clean up PubNub client states from ongoing request.
     *
     * Reset requested and scheduled request information to make PubNub client "free" for neext requests.
     *
     * @param clients - List of PubNub clients which awaited for scheduled request completion.
     * @param requestId - Unique subscribe request identifier for which {@link clients} has been provided.
     */
    const markRequestCompleted = (clients, requestId) => {
        delete serviceRequests[requestId];
        clients.forEach((client) => {
            if (client.subscription) {
                delete client.subscription.request;
                delete client.subscription.serviceRequestId;
            }
        });
    };
    /**
     * Creates a Request object from a given {@link TransportRequest} object.
     *
     * @param req - The {@link TransportRequest} object containing request information.
     *
     * @returns `Request` object generated from the {@link TransportRequest} object or `undefined` if no request
     * should be sent.
     */
    const requestFromTransportRequest = (req) => {
        let headers = undefined;
        const queryParameters = req.queryParameters;
        let path = req.path;
        if (req.headers) {
            headers = {};
            for (const [key, value] of Object.entries(req.headers))
                headers[key] = value;
        }
        if (queryParameters && Object.keys(queryParameters).length !== 0)
            path = `${path}?${queryStringFromObject(queryParameters)}`;
        return new Request(`${req.origin}${path}`, {
            method: req.method,
            headers,
            redirect: 'follow',
        });
    };
    /**
     * Construct transport request from send subscription request event.
     *
     * Update transport request to aggregate channels and groups if possible.
     *
     * @param event - Client's send subscription event request.
     *
     * @returns Final transport request or identifier from active request which will provide response to required
     * channels and groups.
     */
    const subscribeTransportRequestFromEvent = (event) => {
        var _a, _b, _c, _d, _e;
        const client = pubNubClients[event.clientIdentifier];
        const subscription = client.subscription;
        const clients = clientsForSendSubscribeRequestEvent(subscription.timetoken, event);
        const serviceRequestId = uuidGenerator.createUUID();
        const request = Object.assign({}, event.request);
        let previousSubscribeTimetoken;
        let previousSubscribeRegion;
        if (clients.length > 1) {
            const activeRequestId = activeSubscriptionForEvent(clients, event);
            // Return identifier of the ongoing request.
            if (activeRequestId) {
                const scheduledRequest = serviceRequests[activeRequestId];
                const { channels, channelGroups } = (_a = client.subscription) !== null && _a !== void 0 ? _a : { channels: [], channelGroups: [] };
                if ((channels.length > 0 ? includesStrings(scheduledRequest.channels, channels) : true) &&
                    (channelGroups.length > 0 ? includesStrings(scheduledRequest.channelGroups, channelGroups) : true)) {
                    return activeRequestId;
                }
            }
            const state = ((_b = presenceState[client.subscriptionKey]) !== null && _b !== void 0 ? _b : {})[client.userId];
            const aggregatedState = {};
            const channelGroups = new Set(subscription.channelGroups);
            const channels = new Set(subscription.channels);
            if (state && subscription.objectsWithState.length) {
                subscription.objectsWithState.forEach((name) => {
                    const objectState = state[name];
                    if (objectState)
                        aggregatedState[name] = objectState;
                });
            }
            for (const _client of clients) {
                const { subscription: _subscription } = _client;
                // Skip clients which doesn't have active subscription request.
                if (!_subscription)
                    continue;
                // Keep track of timetoken from previous call to use it for catchup after initial subscribe.
                if ((clients.length === 1 || _client.clientIdentifier !== client.clientIdentifier) && _subscription.timetoken) {
                    previousSubscribeTimetoken = _subscription.timetoken;
                    previousSubscribeRegion = _subscription.region;
                }
                _subscription.channelGroups.forEach(channelGroups.add, channelGroups);
                _subscription.channels.forEach(channels.add, channels);
                const activeServiceRequestId = _subscription.serviceRequestId;
                _subscription.serviceRequestId = serviceRequestId;
                // Set awaited service worker request identifier.
                if (activeServiceRequestId && serviceRequests[activeServiceRequestId]) {
                    cancelRequest(activeServiceRequestId);
                }
                if (!state)
                    continue;
                _subscription.objectsWithState.forEach((name) => {
                    const objectState = state[name];
                    if (objectState && !aggregatedState[name])
                        aggregatedState[name] = objectState;
                });
            }
            const serviceRequest = ((_c = serviceRequests[serviceRequestId]) !== null && _c !== void 0 ? _c : (serviceRequests[serviceRequestId] = {
                requestId: serviceRequestId,
                timetoken: (_d = request.queryParameters.tt) !== null && _d !== void 0 ? _d : '0',
                channelGroups: [],
                channels: [],
            }));
            // Update request channels list (if required).
            if (channels.size) {
                serviceRequest.channels = Array.from(channels).sort();
                const pathComponents = request.path.split('/');
                pathComponents[4] = serviceRequest.channels.join(',');
                request.path = pathComponents.join('/');
            }
            // Update request channel groups list (if required).
            if (channelGroups.size) {
                serviceRequest.channelGroups = Array.from(channelGroups).sort();
                request.queryParameters['channel-group'] = serviceRequest.channelGroups.join(',');
            }
            // Update request `state` (if required).
            if (Object.keys(aggregatedState).length)
                request.queryParameters['state'] = JSON.stringify(aggregatedState);
        }
        else {
            serviceRequests[serviceRequestId] = {
                requestId: serviceRequestId,
                timetoken: (_e = request.queryParameters.tt) !== null && _e !== void 0 ? _e : '0',
                channelGroups: subscription.channelGroups,
                channels: subscription.channels,
            };
        }
        if (serviceRequests[serviceRequestId]) {
            if (request.queryParameters &&
                request.queryParameters.tt !== undefined &&
                request.queryParameters.tr !== undefined) {
                serviceRequests[serviceRequestId].region = request.queryParameters.tr;
            }
            serviceRequests[serviceRequestId].timetokenOverride = previousSubscribeTimetoken;
            serviceRequests[serviceRequestId].regionOverride = previousSubscribeRegion;
        }
        subscription.serviceRequestId = serviceRequestId;
        request.identifier = serviceRequestId;
        if (logVerbosity) {
            const clientIds = clients
                .reduce((identifiers, { clientIdentifier }) => {
                identifiers.push(clientIdentifier);
                return identifiers;
            }, [])
                .join(',');
            consoleDir(serviceRequests[serviceRequestId], `Started aggregated request for clients: ${clientIds}`);
        }
        return request;
    };
    /**
     * Construct transport request from send leave request event.
     *
     * Filter out channels and groups, which is still in use by other PubNub client instances from leave request.
     *
     * @param event - Client's send leave event request.
     *
     * @returns Final transport request or `undefined` in case if there is no channels and groups for which request can be
     * done.
     */
    const leaveTransportRequestFromEvent = (event) => {
        const client = pubNubClients[event.clientIdentifier];
        const clients = clientsForSendLeaveRequestEvent(event);
        let channelGroups = channelGroupsFromRequest(event.request);
        let channels = channelsFromRequest(event.request);
        const request = Object.assign({}, event.request);
        if (client && client.subscription) {
            const { subscription } = client;
            if (channels.length)
                subscription.channels = subscription.channels.filter((channel) => !channels.includes(channel));
            if (channelGroups.length) {
                subscription.channelGroups = subscription.channelGroups.filter((group) => !channelGroups.includes(group));
            }
        }
        // Filter out channels and groups which is still in use by the other PubNub client instances.
        for (const client of clients) {
            const subscription = client.subscription;
            if (subscription === undefined)
                continue;
            if (client.clientIdentifier === event.clientIdentifier)
                continue;
            if (channels.length)
                channels = channels.filter((channel) => !subscription.channels.includes(channel));
            if (channelGroups.length)
                channelGroups = channelGroups.filter((group) => !subscription.channelGroups.includes(group));
        }
        if (channels.length === 0 && channelGroups.length === 0) {
            if (logVerbosity && client) {
                const clientIds = clients
                    .reduce((identifiers, { clientIdentifier }) => {
                    identifiers.push(clientIdentifier);
                    return identifiers;
                }, [])
                    .join(',');
                consoleLog(`Specified channels and groups still in use by other clients: ${clientIds}. Ignoring leave request.`, client);
            }
            return undefined;
        }
        // Update request channels list (if required).
        if (channels.length) {
            const pathComponents = request.path.split('/');
            pathComponents[6] = channels.join(',');
            request.path = pathComponents.join('/');
        }
        // Update request channel groups list (if required).
        if (channelGroups.length)
            request.queryParameters['channel-group'] = channelGroups.join(',');
        return request;
    };
    /**
     * Send event to the specific PubNub client.
     *
     * @param client - State for the client which should receive {@link event}.
     * @param event - Subscription worker event object.
     */
    const publishClientEvent = (client, event) => {
        var _a;
        const receiver = ((_a = sharedWorkerClients[client.subscriptionKey]) !== null && _a !== void 0 ? _a : {})[client.clientIdentifier];
        if (!receiver)
            return false;
        try {
            receiver.postMessage(event);
            return true;
        }
        catch (error) { }
        return false;
    };
    /**
     * Send request processing update.
     *
     * @param type - Type of processing event.
     * @param clients - List of PubNub clients which should be notified about request progress.
     * @param timestamp - Date and time when request processing update happened.
     * @param [request] - Processed request information.
     * @param [responseBody] - PubNub service response.
     * @param [contentType] - PubNub service response content type.
     * @param [duration] - How long it took to complete request.
     */
    const notifyRequestProcessing = (type, clients, timestamp, request, responseBody, contentType, duration) => {
        var _a;
        if (clients.length === 0)
            return;
        const clientIds = (_a = sharedWorkerClients[clients[0].subscriptionKey]) !== null && _a !== void 0 ? _a : {};
        let event;
        if (type === 'start') {
            event = {
                type: 'request-progress-start',
                clientIdentifier: '',
                url: '',
                timestamp,
            };
        }
        else {
            let response;
            if (responseBody &&
                contentType &&
                (contentType.indexOf('text/javascript') !== -1 ||
                    contentType.indexOf('application/json') !== -1 ||
                    contentType.indexOf('text/plain') !== -1 ||
                    contentType.indexOf('text/html') !== -1)) {
                response = decoder.decode(responseBody);
            }
            event = {
                type: 'request-progress-end',
                clientIdentifier: '',
                url: '',
                response,
                timestamp,
                duration: duration,
            };
        }
        for (const client of clients) {
            if (client.subscription === undefined)
                continue;
            const serviceWorkerClientId = clientIds[client.clientIdentifier];
            const { request: clientRequest } = client.subscription;
            const decidedRequest = clientRequest !== null && clientRequest !== void 0 ? clientRequest : request;
            if (client.logVerbosity && serviceWorkerClientId && decidedRequest) {
                const payload = Object.assign(Object.assign({}, event), { clientIdentifier: client.clientIdentifier, url: `${decidedRequest.origin}${decidedRequest.path}`, query: decidedRequest.queryParameters });
                publishClientEvent(client, payload);
            }
        }
    };
    /**
     * Send request processing result event.
     *
     * @param clients - List of PubNub clients which should be notified about request result.
     * @param [response] - PubNub service response.
     * @param [request] - Processed request information.
     * @param [result] - Explicit request processing result which should be notified.
     */
    const notifyRequestProcessingResult = (clients, response, request, result) => {
        var _a;
        if (clients.length === 0)
            return;
        if (!result && !response)
            return;
        const clientIds = (_a = sharedWorkerClients[clients[0].subscriptionKey]) !== null && _a !== void 0 ? _a : {};
        if (!result && response) {
            result =
                response[0].status >= 400
                    ? // Treat 4xx and 5xx status codes as errors.
                        requestProcessingError(undefined, response)
                    : requestProcessingSuccess(response);
        }
        for (const client of clients) {
            if (client.subscription === undefined)
                continue;
            const serviceWorkerClientId = clientIds[client.clientIdentifier];
            const { request: clientRequest } = client.subscription;
            const decidedRequest = clientRequest !== null && clientRequest !== void 0 ? clientRequest : request;
            if (serviceWorkerClientId && decidedRequest) {
                const payload = Object.assign(Object.assign({}, result), { clientIdentifier: client.clientIdentifier, identifier: decidedRequest.identifier, url: `${decidedRequest.origin}${decidedRequest.path}` });
                publishClientEvent(client, payload);
            }
        }
    };
    /**
     * Create processing success event from service response.
     *
     * **Note:** The rest of information like `clientIdentifier`,`identifier`, and `url` will be added later for each
     * specific PubNub client state.
     *
     * @param res - Service response for used REST API endpoint along with response body.
     *
     * @returns Request processing success event object.
     */
    const requestProcessingSuccess = (res) => {
        var _a;
        const [response, body] = res;
        const responseBody = body.byteLength > 0 ? body : undefined;
        const contentLength = parseInt((_a = response.headers.get('Content-Length')) !== null && _a !== void 0 ? _a : '0', 10);
        const contentType = response.headers.get('Content-Type');
        const headers = {};
        // Copy Headers object content into plain Record.
        response.headers.forEach((value, key) => (headers[key] = value.toLowerCase()));
        return {
            type: 'request-process-success',
            clientIdentifier: '',
            identifier: '',
            url: '',
            response: {
                contentLength,
                contentType,
                headers,
                status: response.status,
                body: responseBody,
            },
        };
    };
    /**
     * Create processing error event from service response.
     *
     * **Note:** The rest of information like `clientIdentifier`,`identifier`, and `url` will be added later for each
     * specific PubNub client state.
     *
     * @param [error] - Client-side request processing error (for example network issues).
     * @param [res] - Service error response (for example permissions error or malformed
     * payload) along with service body.
     *
     * @returns Request processing error event object.
     */
    const requestProcessingError = (error, res) => {
        // User service response as error information source.
        if (res) {
            return Object.assign(Object.assign({}, requestProcessingSuccess(res)), { type: 'request-process-error' });
        }
        let type = 'NETWORK_ISSUE';
        let message = 'Unknown error';
        let name = 'Error';
        if (error && error instanceof Error) {
            message = error.message;
            name = error.name;
        }
        if (name === 'AbortError') {
            message = 'Request aborted';
            type = 'ABORTED';
        }
        else if (message === 'Request timeout')
            type = 'TIMEOUT';
        return {
            type: 'request-process-error',
            clientIdentifier: '',
            identifier: '',
            url: '',
            error: { name, type, message },
        };
    };
    // endregion
    // --------------------------------------------------------
    // ----------------------- Helpers ------------------------
    // --------------------------------------------------------
    // region Helpers
    /**
     * Register client if it didn't use Service Worker before.
     *
     * The registration process updates the Service Worker state with information about channels and groups in which
     * particular PubNub clients are interested, and uses this information when another subscribe request is made to build
     * shared  requests.
     *
     * @param event - Base information about PubNub client instance and Service Worker {@link Client}.
     */
    const registerClientIfRequired = (event) => {
        var _a, _b;
        var _c, _d;
        const { clientIdentifier } = event;
        if (pubNubClients[clientIdentifier])
            return;
        const client = (pubNubClients[clientIdentifier] = {
            clientIdentifier,
            subscriptionKey: event.subscriptionKey,
            userId: event.userId,
            logVerbosity: event.logVerbosity,
        });
        // Map registered PubNub client to its subscription key.
        const clientsBySubscriptionKey = ((_a = pubNubClientsBySubscriptionKey[_c = event.subscriptionKey]) !== null && _a !== void 0 ? _a : (pubNubClientsBySubscriptionKey[_c] = []));
        if (clientsBySubscriptionKey.every((entry) => entry.clientIdentifier !== clientIdentifier))
            clientsBySubscriptionKey.push(client);
        // Binding PubNub client to the MessagePort (receiver).
        ((_b = sharedWorkerClients[_d = event.subscriptionKey]) !== null && _b !== void 0 ? _b : (sharedWorkerClients[_d] = {}))[clientIdentifier] = event.port;
        consoleLog(`Registered PubNub client with '${clientIdentifier}' identifier. ` +
            `'${Object.keys(pubNubClients).length}' clients currently active.`);
        if (!pingInterval && Object.keys(pubNubClients).length > 0) {
            consoleLog(`Setup PubNub client ping event ${clientPingRequestInterval / 1000} seconds`);
            pingInterval = setInterval(() => pingClients(), clientPingRequestInterval);
        }
    };
    /**
     * Update information about previously registered client.
     *
     * Use information from request to populate list of channels and other useful information.
     *
     * @param event - Send request.
     */
    const updateClientStateIfRequired = (event) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var _m, _o, _p, _q, _r, _s, _t, _u, _v;
        const query = event.request.queryParameters;
        const { clientIdentifier } = event;
        const client = pubNubClients[clientIdentifier];
        // This should never happen.
        if (!client)
            return;
        const channelGroupQuery = ((_a = query['channel-group']) !== null && _a !== void 0 ? _a : '');
        const state = ((_b = query.state) !== null && _b !== void 0 ? _b : '');
        let subscription = client.subscription;
        if (!subscription) {
            subscription = {
                path: '',
                channelGroupQuery: '',
                channels: [],
                channelGroups: [],
                previousTimetoken: '0',
                timetoken: '0',
                objectsWithState: [],
            };
            if (state.length > 0) {
                const parsedState = JSON.parse(state);
                const userState = ((_d = (_o = ((_c = presenceState[_m = client.subscriptionKey]) !== null && _c !== void 0 ? _c : (presenceState[_m] = {})))[_p = client.userId]) !== null && _d !== void 0 ? _d : (_o[_p] = {}));
                Object.entries(parsedState).forEach(([objectName, value]) => (userState[objectName] = value));
                subscription.objectsWithState = Object.keys(parsedState);
            }
            client.subscription = subscription;
        }
        else {
            if (state.length > 0) {
                const parsedState = JSON.parse(state);
                const userState = ((_f = (_r = ((_e = presenceState[_q = client.subscriptionKey]) !== null && _e !== void 0 ? _e : (presenceState[_q] = {})))[_s = client.userId]) !== null && _f !== void 0 ? _f : (_r[_s] = {}));
                Object.entries(parsedState).forEach(([objectName, value]) => (userState[objectName] = value));
                // Clean up state for objects where presence state has been reset.
                for (const objectName of subscription.objectsWithState)
                    if (!parsedState[objectName])
                        delete userState[objectName];
                subscription.objectsWithState = Object.keys(parsedState);
            }
            // Handle potential presence state reset.
            else if (subscription.objectsWithState.length) {
                const userState = ((_h = (_u = ((_g = presenceState[_t = client.subscriptionKey]) !== null && _g !== void 0 ? _g : (presenceState[_t] = {})))[_v = client.userId]) !== null && _h !== void 0 ? _h : (_u[_v] = {}));
                for (const objectName of subscription.objectsWithState)
                    delete userState[objectName];
                subscription.objectsWithState = [];
            }
        }
        if (subscription.path !== event.request.path) {
            subscription.path = event.request.path;
            subscription.channels = channelsFromRequest(event.request);
        }
        if (subscription.channelGroupQuery !== channelGroupQuery) {
            subscription.channelGroupQuery = channelGroupQuery;
            subscription.channelGroups = channelGroupsFromRequest(event.request);
        }
        subscription.request = event.request;
        subscription.filterExpression = ((_j = query['filter-expr']) !== null && _j !== void 0 ? _j : '');
        subscription.timetoken = ((_k = query.tt) !== null && _k !== void 0 ? _k : '0');
        if (query.tr !== undefined)
            subscription.region = query.tr;
        client.authKey = ((_l = query.auth) !== null && _l !== void 0 ? _l : '');
        client.userId = query.uuid;
    };
    /**
     * Handle PubNub client response on PING request.
     *
     * @param event - Information about client which responded on PING request.
     */
    const handleClientPong = (event) => {
        const client = pubNubClients[event.clientIdentifier];
        if (!client)
            return;
        client.lastPongEvent = new Date().getTime() / 1000;
    };
    /**
     * Clean up resources used by registered PubNub client instance.
     *
     * @param subscriptionKey - Subscription key which has been used by the
     * invalidated instance.
     * @param clientId - Unique PubNub client identifier.
     */
    const invalidateClient = (subscriptionKey, clientId) => {
        delete pubNubClients[clientId];
        let clients = pubNubClientsBySubscriptionKey[subscriptionKey];
        if (clients) {
            // Clean up linkage between client and subscription key.
            clients = clients.filter((client) => client.clientIdentifier !== clientId);
            if (clients.length > 0)
                pubNubClientsBySubscriptionKey[subscriptionKey] = clients;
            else
                delete pubNubClientsBySubscriptionKey[subscriptionKey];
            // Clean up presence state information if not in use anymore.
            if (clients.length === 0)
                delete presenceState[subscriptionKey];
            // Clean up service workers client linkage to PubNub clients.
            if (clients.length > 0) {
                const workerClients = sharedWorkerClients[subscriptionKey];
                if (workerClients) {
                    delete workerClients[clientId];
                    if (Object.keys(workerClients).length === 0)
                        delete sharedWorkerClients[subscriptionKey];
                }
            }
            else
                delete sharedWorkerClients[subscriptionKey];
        }
        consoleLog(`Invalidate '${clientId}' client. '${Object.keys(pubNubClients).length}' clients currently active.`);
    };
    /**
     * Validate received event payload.
     */
    const validateEventPayload = (event) => {
        const { clientIdentifier, subscriptionKey, logVerbosity } = event.data;
        if (logVerbosity === undefined || typeof logVerbosity !== 'boolean')
            return false;
        if (!clientIdentifier || typeof clientIdentifier !== 'string')
            return false;
        return !(!subscriptionKey || typeof subscriptionKey !== 'string');
    };
    /**
     * Search for active subscription for one of the passed {@link sharedWorkerClients}.
     *
     * @param activeClients - List of suitable registered PubNub clients.
     * @param event - Send Subscriber Request event data.
     *
     * @returns Unique identifier of the active request which will receive real-time updates for channels and groups
     * requested in received subscription request or `undefined` if none of active (or not scheduled) request can be used.
     */
    const activeSubscriptionForEvent = (activeClients, event) => {
        var _a;
        const query = event.request.queryParameters;
        const channelGroupQuery = ((_a = query['channel-group']) !== null && _a !== void 0 ? _a : '');
        const requestPath = event.request.path;
        let channelGroups;
        let channels;
        for (const client of activeClients) {
            const { subscription } = client;
            // Skip PubNub clients which doesn't await for subscription response.
            if (!subscription || !subscription.serviceRequestId)
                continue;
            const sourceClient = pubNubClients[event.clientIdentifier];
            const requestId = subscription.serviceRequestId;
            if (subscription.path === requestPath && subscription.channelGroupQuery === channelGroupQuery) {
                consoleLog(`Found identical request started by '${client.clientIdentifier}' client. 
Waiting for existing '${requestId}' request completion.`, sourceClient);
                return subscription.serviceRequestId;
            }
            else {
                const scheduledRequest = serviceRequests[subscription.serviceRequestId];
                if (!channelGroups)
                    channelGroups = channelGroupsFromRequest(event.request);
                if (!channels)
                    channels = channelsFromRequest(event.request);
                // Checking whether all required channels and groups are handled already by active request or not.
                if (channels.length && !includesStrings(scheduledRequest.channels, channels))
                    continue;
                if (channelGroups.length && !includesStrings(scheduledRequest.channelGroups, channelGroups))
                    continue;
                consoleDir(scheduledRequest, `'${event.request.identifier}' request channels and groups are subset of ongoing '${requestId}' request 
which has started by '${client.clientIdentifier}' client. Waiting for existing '${requestId}' request completion.`, sourceClient);
                return subscription.serviceRequestId;
            }
        }
        return undefined;
    };
    /**
     * Find PubNub client states with configuration compatible with the one in request.
     *
     * Method allow to find information about all PubNub client instances which use same:
     * - subscription key
     * - `userId`
     * - `auth` key
     * - `filter expression`
     * - `timetoken` (compare should be done against previous timetoken of the client which requested new subscribe).
     *
     * @param timetoken - Previous timetoken used by the PubNub client which requested to send new subscription request
     * (it will be the same as 'current' timetoken of the other PubNub clients).
     * @param event - Send subscribe request event information.
     *
     * @returns List of PubNub client states which works from other pages for the same user.
     */
    const clientsForSendSubscribeRequestEvent = (timetoken, event) => {
        var _a, _b, _c;
        const query = event.request.queryParameters;
        const filterExpression = ((_a = query['filter-expr']) !== null && _a !== void 0 ? _a : '');
        const authKey = ((_b = query.auth) !== null && _b !== void 0 ? _b : '');
        const userId = query.uuid;
        return ((_c = pubNubClientsBySubscriptionKey[event.subscriptionKey]) !== null && _c !== void 0 ? _c : []).filter((client) => client.userId === userId &&
            client.authKey === authKey &&
            client.subscription &&
            // Only clients with active subscription can be used.
            (client.subscription.channels.length !== 0 || client.subscription.channelGroups.length !== 0) &&
            client.subscription.filterExpression === filterExpression &&
            (timetoken === '0' || client.subscription.timetoken === '0' || client.subscription.timetoken === timetoken));
    };
    /**
     * Find PubNub client states with configuration compatible with the one in request.
     *
     * Method allow to find information about all PubNub client instances which use same:
     * - subscription key
     * - `userId`
     * - `auth` key
     *
     * @param event - Send leave request event information.
     *
     * @returns List of PubNub client states which works from other pages for the same user.
     */
    const clientsForSendLeaveRequestEvent = (event) => {
        var _a, _b;
        const query = event.request.queryParameters;
        const authKey = ((_a = query.auth) !== null && _a !== void 0 ? _a : '');
        const userId = query.uuid;
        return ((_b = pubNubClientsBySubscriptionKey[event.subscriptionKey]) !== null && _b !== void 0 ? _b : []).filter((client) => client.userId === userId && client.authKey === authKey);
    };
    /**
     * Extract list of channels from request URI path.
     *
     * @param request - Transport request which should provide `path` for parsing.
     *
     * @returns List of channel names (not percent-decoded) for which `subscribe` or `leave` has been called.
     */
    const channelsFromRequest = (request) => {
        const channels = request.path.split('/')[request.path.startsWith('/v2/subscribe/') ? 4 : 6];
        return channels === ',' ? [] : channels.split(',').filter((name) => name.length > 0);
    };
    /**
     * Extract list of channel groups from request query.
     *
     * @param request - Transport request which should provide `query` for parsing.
     *
     * @returns List of channel group names (not percent-decoded) for which `subscribe` or `leave` has been called.
     */
    const channelGroupsFromRequest = (request) => {
        var _a;
        const group = ((_a = request.queryParameters['channel-group']) !== null && _a !== void 0 ? _a : '');
        return group.length === 0 ? [] : group.split(',').filter((name) => name.length > 0);
    };
    /**
     * Check whether {@link main} array contains all entries from {@link sub} array.
     *
     * @param main - Main array with which `intersection` with {@link sub} should be checked.
     * @param sub - Sub-array whose values should be checked in {@link main}.
     *
     * @returns `true` if all entries from {@link sub} is present in {@link main}.
     */
    const includesStrings = (main, sub) => {
        const set = new Set(main);
        return sub.every(set.has, set);
    };
    /**
     * Send PubNub client PING request to identify disconnected instances.
     */
    const pingClients = () => {
        consoleLog(`Pinging clients...`);
        const payload = { type: 'shared-worker-ping' };
        Object.values(pubNubClients).forEach((client) => {
            let clientInvalidated = false;
            if (client && client.lastPingRequest) {
                consoleLog(`Checking whether ${client.clientIdentifier} ping has been sent too long ago...`);
                // Check whether client never respond or last response was too long time ago.
                if (!client.lastPongEvent ||
                    Math.abs(client.lastPongEvent - client.lastPingRequest) > (clientPingRequestInterval / 1000) * 0.5) {
                    clientInvalidated = true;
                    consoleLog(`'${client.clientIdentifier}' client is inactive. Invalidating.`);
                    invalidateClient(client.subscriptionKey, client.clientIdentifier);
                }
            }
            if (client && !clientInvalidated) {
                consoleLog(`Sending ping to ${client.clientIdentifier}...`);
                client.lastPingRequest = new Date().getTime() / 1000;
                publishClientEvent(client, payload);
            }
        });
        // Cancel interval if there is no active clients.
        if (Object.keys(pubNubClients).length === 0 && pingInterval)
            clearInterval(pingInterval);
    };
    /**
     * Print message on the worker's clients console.
     *
     * @param message - Message which should be printed.
     * @param [client] - Target client to which log message should be sent.
     */
    const consoleLog = (message, client) => {
        if (!logVerbosity)
            return;
        const clients = client ? [client] : Object.values(pubNubClients);
        const payload = {
            type: 'shared-worker-console-log',
            message,
        };
        clients.forEach((client) => {
            if (client)
                publishClientEvent(client, payload);
        });
    };
    /**
     * Print message on the worker's clients console.
     *
     * @param data - Data which should be printed into the console.
     * @param [message] - Message which should be printed before {@link data}.
     * @param [client] - Target client to which log message should be sent.
     */
    const consoleDir = (data, message, client) => {
        if (!logVerbosity)
            return;
        const clients = client ? [client] : Object.values(pubNubClients);
        const payload = {
            type: 'shared-worker-console-dir',
            message,
            data,
        };
        clients.forEach((client) => {
            if (client)
                publishClientEvent(client, payload);
        });
    };
    /**
     * Stringify request query key / value pairs.
     *
     * @param query - Request query object.
     *
     * @returns Stringified query object.
     */
    const queryStringFromObject = (query) => {
        return Object.keys(query)
            .map((key) => {
            const queryValue = query[key];
            if (!Array.isArray(queryValue))
                return `${key}=${encodeString(queryValue)}`;
            return queryValue.map((value) => `${key}=${encodeString(value)}`).join('&');
        })
            .join('&');
    };
    /**
     * Percent-encode input string.
     *
     * **Note:** Encode content in accordance of the `PubNub` service requirements.
     *
     * @param input - Source string or number for encoding.
     *
     * @returns Percent-encoded string.
     */
    const encodeString = (input) => {
        return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
    };
    // endregion
    // endregion

}));
