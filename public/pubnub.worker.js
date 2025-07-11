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
    /* global Reflect, Promise, SuppressedError, Symbol, Iterator */


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

    /**
     * Enum representing possible transport methods for HTTP requests.
     *
     * @enum {number}
     */
    var TransportMethod;
    (function (TransportMethod) {
        /**
         * Request will be sent using `GET` method.
         */
        TransportMethod["GET"] = "GET";
        /**
         * Request will be sent using `POST` method.
         */
        TransportMethod["POST"] = "POST";
        /**
         * Request will be sent using `PATCH` method.
         */
        TransportMethod["PATCH"] = "PATCH";
        /**
         * Request will be sent using `DELETE` method.
         */
        TransportMethod["DELETE"] = "DELETE";
        /**
         * Local request.
         *
         * Request won't be sent to the service and probably used to compute URL.
         */
        TransportMethod["LOCAL"] = "LOCAL";
    })(TransportMethod || (TransportMethod = {}));

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

    /**
     * Random identifier generator helper module.
     *
     * @internal
     */
    /** @internal */
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
     *
     * @internal
     */
    /**
     * Aggregation timer timeout.
     *
     * Timeout used by the timer to postpone `handleSendSubscribeRequestEvent` function call and let other clients for
     * same subscribe key send next subscribe loop request (to make aggregation more efficient).
     */
    const subscribeAggregationTimeout = 50;
    /**
     * Map of clients aggregation keys to the started aggregation timeout timers with client and event information.
     */
    const aggregationTimers = new Map();
    // region State
    /**
     * Per-subscription key map of "offline" clients detection timeouts.
     */
    const pingTimeouts = {};
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
     * Per-subscription key map of heartbeat request configurations recently used for user.
     */
    const serviceHeartbeatRequests = {};
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
                    // Appending information about messaging port for responses.
                    data.port = receiver;
                    registerClientIfRequired(data);
                    consoleLog(`Client '${data.clientIdentifier}' registered with '${sharedWorkerIdentifier}' shared worker`);
                }
                else if (data.type === 'client-update')
                    updateClientInformation(data);
                else if (data.type === 'client-unregister')
                    unRegisterClient(data);
                else if (data.type === 'client-pong')
                    handleClientPong(data);
                else if (data.type === 'send-request') {
                    if (data.request.path.startsWith('/v2/subscribe')) {
                        const changedSubscription = updateClientSubscribeStateIfRequired(data);
                        const client = pubNubClients[data.clientIdentifier];
                        if (client) {
                            // Check whether there are more clients which may schedule next subscription loop and they need to be
                            // aggregated or not.
                            const timerIdentifier = aggregateTimerId(client);
                            let enqueuedClients = [];
                            if (aggregationTimers.has(timerIdentifier))
                                enqueuedClients = aggregationTimers.get(timerIdentifier)[0];
                            enqueuedClients.push([client, data]);
                            // Clear existing aggregation timer if subscription list changed.
                            if (aggregationTimers.has(timerIdentifier) && changedSubscription) {
                                clearTimeout(aggregationTimers.get(timerIdentifier)[1]);
                                aggregationTimers.delete(timerIdentifier);
                            }
                            // Check whether we need to start new aggregation timer or not.
                            if (!aggregationTimers.has(timerIdentifier)) {
                                const aggregationTimer = setTimeout(() => {
                                    handleSendSubscribeRequestEventForClients(enqueuedClients, data);
                                    aggregationTimers.delete(timerIdentifier);
                                }, subscribeAggregationTimeout);
                                aggregationTimers.set(timerIdentifier, [enqueuedClients, aggregationTimer]);
                            }
                        }
                    }
                    else if (data.request.path.endsWith('/heartbeat')) {
                        updateClientHeartbeatState(data);
                        handleHeartbeatRequestEvent(data);
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
     * Handle aggregated clients request to send subscription request.
     *
     * @param clients - List of aggregated clients which would like to send subscription requests.
     * @param event - Subscription event details.
     */
    const handleSendSubscribeRequestEventForClients = (clients, event) => {
        const requestOrId = subscribeTransportRequestFromEvent(event);
        const client = pubNubClients[event.clientIdentifier];
        if (!client)
            return;
        // Getting rest of aggregated clients.
        clients = clients.filter((aggregatedClient) => aggregatedClient[0].clientIdentifier !== client.clientIdentifier);
        handleSendSubscribeRequestForClient(client, event, requestOrId, true);
        clients.forEach(([aggregatedClient, clientEvent]) => handleSendSubscribeRequestForClient(aggregatedClient, clientEvent, requestOrId, false));
    };
    /**
     * Handle subscribe request by single client.
     *
     * @param client - Client which processes `request`.
     * @param event - Subscription event details.
     * @param requestOrId - New aggregated request object or its identifier (if already scheduled).
     * @param requestOrigin - Whether `client` is the one who triggered subscribe request or not.
     */
    const handleSendSubscribeRequestForClient = (client, event, requestOrId, requestOrigin) => {
        var _a;
        let isInitialSubscribe = false;
        if (!requestOrigin && typeof requestOrId !== 'string')
            requestOrId = requestOrId.identifier;
        if (client.subscription)
            isInitialSubscribe = client.subscription.timetoken === '0';
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
                publishClientEvent(client, result);
            }
            return;
        }
        if (event.request.cancellable)
            abortControllers.set(requestOrId.identifier, new AbortController());
        const scheduledRequest = serviceRequests[requestOrId.identifier];
        const { timetokenOverride, regionOverride } = scheduledRequest;
        sendRequest(requestOrId, () => clientsForRequest(requestOrId.identifier), (clients, fetchRequest, response) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, fetchRequest, response, event.request);
            // Clean up scheduled request and client references to it.
            markRequestCompleted(clients, requestOrId.identifier);
        }, (clients, fetchRequest, error) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, fetchRequest, null, event.request, requestProcessingError(error));
            // Clean up scheduled request and client references to it.
            markRequestCompleted(clients, requestOrId.identifier);
        }, (response) => {
            let serverResponse = response;
            if (isInitialSubscribe && timetokenOverride && timetokenOverride !== '0') {
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
     * Handle client heartbeat request.
     *
     * @param event - Heartbeat event details.
     * @param [actualRequest] - Whether handling actual request from the core-part of the client and not backup heartbeat in
     * the `SharedWorker`.
     * @param [outOfOrder] - Whether handling request which is sent on irregular basis (setting update).
     */
    const handleHeartbeatRequestEvent = (event, actualRequest = true, outOfOrder = false) => {
        var _a;
        const client = pubNubClients[event.clientIdentifier];
        const request = heartbeatTransportRequestFromEvent(event, actualRequest, outOfOrder);
        if (!client)
            return;
        const heartbeatRequestKey = `${client.userId}_${(_a = clientAggregateAuthKey(client)) !== null && _a !== void 0 ? _a : ''}`;
        const hbRequestsBySubscriptionKey = serviceHeartbeatRequests[client.subscriptionKey];
        const hbRequests = (hbRequestsBySubscriptionKey !== null && hbRequestsBySubscriptionKey !== void 0 ? hbRequestsBySubscriptionKey : {})[heartbeatRequestKey];
        if (!request) {
            consoleLog(`Previous heartbeat request has been sent less than ${client.heartbeatInterval} seconds ago. Skipping...`, client);
            let response;
            let body;
            // Pulling out previous response.
            if (hbRequests && hbRequests.response)
                [response, body] = hbRequests.response;
            if (!response) {
                body = new TextEncoder().encode('{ "status": 200, "message": "OK", "service": "Presence" }').buffer;
                const headers = new Headers({
                    'Content-Type': 'text/javascript; charset="UTF-8"',
                    'Content-Length': `${body.byteLength}`,
                });
                response = new Response(body, { status: 200, headers });
            }
            const result = requestProcessingSuccess([response, body]);
            result.url = `${event.request.origin}${event.request.path}`;
            result.clientIdentifier = event.clientIdentifier;
            result.identifier = event.request.identifier;
            publishClientEvent(client, result);
            return;
        }
        sendRequest(request, () => [client], (clients, fetchRequest, response) => {
            if (hbRequests)
                hbRequests.response = response;
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, fetchRequest, response, event.request);
            // Stop heartbeat timer on client error status codes.
            if (response[0].status >= 400 && response[0].status < 500)
                stopHeartbeatTimer(client);
        }, (clients, fetchRequest, error) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, fetchRequest, null, event.request, requestProcessingError(error));
        });
        consoleLog(`Started heartbeat request.`, client);
        // Start "backup" heartbeat timer.
        if (!outOfOrder)
            startHeartbeatTimer(client);
    };
    /**
     * Handle client request to leave request.
     *
     * @param data - Leave event details.
     * @param [invalidatedClient] - Specific client to handle leave request.
     * @param [invalidatedClientServiceRequestId] - Identifier of the service request ID for which the invalidated
     * client waited for a subscribe response.
     */
    const handleSendLeaveRequestEvent = (data, invalidatedClient, invalidatedClientServiceRequestId) => {
        var _a, _b;
        var _c;
        const client = invalidatedClient !== null && invalidatedClient !== void 0 ? invalidatedClient : pubNubClients[data.clientIdentifier];
        const request = leaveTransportRequestFromEvent(data, invalidatedClient);
        if (!client)
            return;
        // Clean up client subscription information if there is no more channels / groups to use.
        const { subscription, heartbeat } = client;
        const serviceRequestId = invalidatedClientServiceRequestId !== null && invalidatedClientServiceRequestId !== void 0 ? invalidatedClientServiceRequestId : subscription === null || subscription === void 0 ? void 0 : subscription.serviceRequestId;
        if (subscription && subscription.channels.length === 0 && subscription.channelGroups.length === 0) {
            subscription.channelGroupQuery = '';
            subscription.path = '';
            subscription.previousTimetoken = '0';
            subscription.timetoken = '0';
            delete subscription.region;
            delete subscription.serviceRequestId;
            delete subscription.request;
        }
        if (serviceHeartbeatRequests[client.subscriptionKey]) {
            if (heartbeat && heartbeat.channels.length === 0 && heartbeat.channelGroups.length === 0) {
                const hbRequestsBySubscriptionKey = ((_a = serviceHeartbeatRequests[_c = client.subscriptionKey]) !== null && _a !== void 0 ? _a : (serviceHeartbeatRequests[_c] = {}));
                const heartbeatRequestKey = `${client.userId}_${(_b = clientAggregateAuthKey(client)) !== null && _b !== void 0 ? _b : ''}`;
                if (hbRequestsBySubscriptionKey[heartbeatRequestKey] &&
                    hbRequestsBySubscriptionKey[heartbeatRequestKey].clientIdentifier === client.clientIdentifier)
                    delete hbRequestsBySubscriptionKey[heartbeatRequestKey].clientIdentifier;
                delete heartbeat.heartbeatEvent;
                stopHeartbeatTimer(client);
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
        sendRequest(request, () => [client], (clients, fetchRequest, response) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, fetchRequest, response, data.request);
        }, (clients, fetchRequest, error) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, fetchRequest, null, data.request, requestProcessingError(error));
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
        const sendRequest = {
            type: 'send-request',
            clientIdentifier: clientWithRequest.clientIdentifier,
            subscriptionKey: clientWithRequest.subscriptionKey,
            request,
        };
        handleSendSubscribeRequestEventForClients([[clientWithRequest, sendRequest]], sendRequest);
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
            const fetchRequest = requestFromTransportRequest(request);
            // Notify about request processing start.
            for (const client of getClients())
                consoleLog({ messageType: 'network-request', message: request }, client);
            Promise.race([
                fetch(fetchRequest, {
                    signal: (_a = abortControllers.get(request.identifier)) === null || _a === void 0 ? void 0 : _a.signal,
                    keepalive: true,
                }),
                requestTimeoutTimer(request.identifier, request.timeout),
            ])
                .then((response) => response.arrayBuffer().then((buffer) => [response, buffer]))
                .then((response) => (responsePreProcess ? responsePreProcess(response) : response))
                .then((response) => {
                const clients = getClients();
                if (clients.length === 0)
                    return;
                success(clients, fetchRequest, response);
            })
                .catch((error) => {
                const clients = getClients();
                if (clients.length === 0)
                    return;
                let fetchError = error;
                if (typeof error === 'string') {
                    const errorMessage = error.toLowerCase();
                    fetchError = new Error(error);
                    if (!errorMessage.includes('timeout') && errorMessage.includes('cancel'))
                        fetchError.name = 'AbortError';
                }
                failure(clients, fetchRequest, fetchError);
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
                controller.abort('Cancel request');
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
     * Reset requested and scheduled request information to make PubNub client "free" for next requests.
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
            // Update `auth` key (if required).
            if (request.queryParameters && request.queryParameters.auth) {
                const authKey = authKeyForAggregatedClientsRequest(clients);
                if (authKey)
                    request.queryParameters.auth = authKey;
            }
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
        const clientIds = clients
            .reduce((identifiers, { clientIdentifier }) => {
            identifiers.push(clientIdentifier);
            return identifiers;
        }, [])
            .join(', ');
        if (clientIds.length > 0) {
            for (const _client of clients)
                consoleDir(serviceRequests[serviceRequestId], `Started aggregated request for clients: ${clientIds}`, _client);
        }
        return request;
    };
    /**
     * Construct transport request from send heartbeat request event.
     *
     * Update transport request to aggregate channels and groups if possible.
     *
     * @param event - Client's send heartbeat event request.
     * @param [actualRequest] - Whether handling actual request from the core-part of the client and not backup heartbeat in
     * the `SharedWorker`.
     * @param [outOfOrder] - Whether handling request which is sent on irregular basis (setting update).
     *
     * @returns Final transport request or identifier from active request which will provide response to required
     * channels and groups.
     */
    const heartbeatTransportRequestFromEvent = (event, actualRequest, outOfOrder) => {
        var _a, _b, _c, _d;
        var _e;
        const client = pubNubClients[event.clientIdentifier];
        const clients = clientsForSendHeartbeatRequestEvent(event);
        const request = Object.assign({}, event.request);
        if (!client || !client.heartbeat)
            return undefined;
        const hbRequestsBySubscriptionKey = ((_a = serviceHeartbeatRequests[_e = client.subscriptionKey]) !== null && _a !== void 0 ? _a : (serviceHeartbeatRequests[_e] = {}));
        const heartbeatRequestKey = `${client.userId}_${(_b = clientAggregateAuthKey(client)) !== null && _b !== void 0 ? _b : ''}`;
        const channelGroupsForAnnouncement = [...client.heartbeat.channelGroups];
        const channelsForAnnouncement = [...client.heartbeat.channels];
        let aggregatedState;
        let failedPreviousRequest = false;
        let aggregated;
        if (!hbRequestsBySubscriptionKey[heartbeatRequestKey]) {
            hbRequestsBySubscriptionKey[heartbeatRequestKey] = {
                createdByActualRequest: actualRequest,
                channels: channelsForAnnouncement,
                channelGroups: channelGroupsForAnnouncement,
                clientIdentifier: client.clientIdentifier,
                timestamp: Date.now(),
            };
            aggregatedState = (_c = client.heartbeat.presenceState) !== null && _c !== void 0 ? _c : {};
            aggregated = false;
        }
        else {
            const { createdByActualRequest, channels, channelGroups, response } = hbRequestsBySubscriptionKey[heartbeatRequestKey];
            // Allow out-of-order call from the client for heartbeat initiated by the `SharedWorker`.
            if (!createdByActualRequest && actualRequest) {
                hbRequestsBySubscriptionKey[heartbeatRequestKey].createdByActualRequest = true;
                hbRequestsBySubscriptionKey[heartbeatRequestKey].timestamp = Date.now();
                outOfOrder = true;
            }
            aggregatedState = (_d = client.heartbeat.presenceState) !== null && _d !== void 0 ? _d : {};
            aggregated =
                includesStrings(channels, channelsForAnnouncement) &&
                    includesStrings(channelGroups, channelGroupsForAnnouncement);
            if (response)
                failedPreviousRequest = response[0].status >= 400;
        }
        // Find minimum heartbeat interval which maybe required to use.
        let minimumHeartbeatInterval = client.heartbeatInterval;
        for (const client of clients) {
            if (client.heartbeatInterval)
                minimumHeartbeatInterval = Math.min(minimumHeartbeatInterval, client.heartbeatInterval);
        }
        // Check whether multiple instance aggregate heartbeat and there is previous sender known.
        // `clientIdentifier` maybe empty in case if client which triggered heartbeats before has been invalidated and new
        // should handle heartbeat unconditionally.
        if (aggregated && hbRequestsBySubscriptionKey[heartbeatRequestKey].clientIdentifier) {
            const expectedTimestamp = hbRequestsBySubscriptionKey[heartbeatRequestKey].timestamp + minimumHeartbeatInterval * 1000;
            const currentTimestamp = Date.now();
            // Check whether it is too soon to send request or not.
            // Request should be sent if a previous attempt failed.
            const leeway = minimumHeartbeatInterval * 0.05 * 1000;
            if (!outOfOrder &&
                !failedPreviousRequest &&
                currentTimestamp < expectedTimestamp &&
                expectedTimestamp - currentTimestamp > leeway)
                return undefined;
        }
        delete hbRequestsBySubscriptionKey[heartbeatRequestKey].response;
        hbRequestsBySubscriptionKey[heartbeatRequestKey].clientIdentifier = client.clientIdentifier;
        // Aggregate channels for similar clients which is pending for heartbeat.
        for (const _client of clients) {
            const { heartbeat } = _client;
            if (heartbeat === undefined || _client.clientIdentifier === event.clientIdentifier)
                continue;
            // Append presence state from the client (will override previously set value if already set).
            if (heartbeat.presenceState)
                aggregatedState = Object.assign(Object.assign({}, aggregatedState), heartbeat.presenceState);
            channelGroupsForAnnouncement.push(...heartbeat.channelGroups.filter((channel) => !channelGroupsForAnnouncement.includes(channel)));
            channelsForAnnouncement.push(...heartbeat.channels.filter((channel) => !channelsForAnnouncement.includes(channel)));
        }
        hbRequestsBySubscriptionKey[heartbeatRequestKey].channels = channelsForAnnouncement;
        hbRequestsBySubscriptionKey[heartbeatRequestKey].channelGroups = channelGroupsForAnnouncement;
        if (!outOfOrder)
            hbRequestsBySubscriptionKey[heartbeatRequestKey].timestamp = Date.now();
        // Remove presence state for objects which is not part of heartbeat.
        for (const objectName in Object.keys(aggregatedState)) {
            if (!channelsForAnnouncement.includes(objectName) && !channelGroupsForAnnouncement.includes(objectName))
                delete aggregatedState[objectName];
        }
        // No need to try send request with empty list of channels and groups.
        if (channelsForAnnouncement.length === 0 && channelGroupsForAnnouncement.length === 0)
            return undefined;
        // Update request channels list (if required).
        if (channelsForAnnouncement.length || channelGroupsForAnnouncement.length) {
            const pathComponents = request.path.split('/');
            pathComponents[6] = channelsForAnnouncement.length ? channelsForAnnouncement.join(',') : ',';
            request.path = pathComponents.join('/');
        }
        // Update request channel groups list (if required).
        if (channelGroupsForAnnouncement.length)
            request.queryParameters['channel-group'] = channelGroupsForAnnouncement.join(',');
        // Update request `state` (if required).
        if (Object.keys(aggregatedState).length)
            request.queryParameters['state'] = JSON.stringify(aggregatedState);
        else
            delete request.queryParameters['state'];
        // Update `auth` key (if required).
        if (clients.length > 1 && request.queryParameters && request.queryParameters.auth) {
            const aggregatedAuthKey = authKeyForAggregatedClientsRequest(clients);
            if (aggregatedAuthKey)
                request.queryParameters.auth = aggregatedAuthKey;
        }
        return request;
    };
    /**
     * Construct transport request from send leave request event.
     *
     * Filter out channels and groups, which is still in use by other PubNub client instances from leave request.
     *
     * @param event - Client's sending leave event request.
     * @param [invalidatedClient] - Invalidated PubNub client state.
     *
     * @returns Final transport request or `undefined` in case if there are no channels and groups for which request can be
     * done.
     */
    const leaveTransportRequestFromEvent = (event, invalidatedClient) => {
        var _a;
        const client = invalidatedClient !== null && invalidatedClient !== void 0 ? invalidatedClient : pubNubClients[event.clientIdentifier];
        const clients = clientsForSendLeaveRequestEvent(event, invalidatedClient);
        let channelGroups = channelGroupsFromRequest(event.request);
        let channels = channelsFromRequest(event.request);
        const request = Object.assign({}, event.request);
        // Remove channels / groups from active client's subscription.
        if (client && client.subscription) {
            const { subscription } = client;
            if (channels.length) {
                subscription.channels = subscription.channels.filter((channel) => !channels.includes(channel));
                // Modify cached request path.
                const pathComponents = subscription.path.split('/');
                if (pathComponents[4] !== ',') {
                    const pathChannels = pathComponents[4].split(',').filter((channel) => !channels.includes(channel));
                    pathComponents[4] = pathChannels.length ? pathChannels.join(',') : ',';
                    subscription.path = pathComponents.join('/');
                }
            }
            if (channelGroups.length) {
                subscription.channelGroups = subscription.channelGroups.filter((group) => !channelGroups.includes(group));
                // Modify cached request path.
                if (subscription.channelGroupQuery.length > 0) {
                    const queryChannelGroups = subscription.channelGroupQuery
                        .split(',')
                        .filter((group) => !channelGroups.includes(group));
                    subscription.channelGroupQuery = queryChannelGroups.length ? queryChannelGroups.join(',') : '';
                }
            }
        }
        // Remove channels / groups from client's presence heartbeat state.
        if (client && client.heartbeat) {
            const { heartbeat } = client;
            if (channels.length)
                heartbeat.channels = heartbeat.channels.filter((channel) => !channels.includes(channel));
            if (channelGroups.length)
                heartbeat.channelGroups = heartbeat.channelGroups.filter((channel) => !channelGroups.includes(channel));
        }
        // Filter out channels and groups which is still in use by the other PubNub client instances.
        for (const client of clients) {
            const subscription = client.subscription;
            if (subscription === undefined)
                continue;
            if (client.clientIdentifier === event.clientIdentifier)
                continue;
            if (channels.length)
                channels = channels.filter((channel) => !channel.endsWith('-pnpres') && !subscription.channels.includes(channel));
            if (channelGroups.length)
                channelGroups = channelGroups.filter((group) => !group.endsWith('-pnpres') && !subscription.channelGroups.includes(group));
        }
        // Clean up from presence channels and groups
        const channelsAndGroupsCount = channels.length + channelGroups.length;
        if (channels.length)
            channels = channels.filter((channel) => !channel.endsWith('-pnpres'));
        if (channelGroups.length)
            channelGroups = channelGroups.filter((group) => !group.endsWith('-pnpres'));
        if (channels.length === 0 && channelGroups.length === 0) {
            if (client && client.workerLogVerbosity) {
                const clientIds = clients
                    .reduce((identifiers, { clientIdentifier }) => {
                    identifiers.push(clientIdentifier);
                    return identifiers;
                }, [])
                    .join(', ');
                if (channelsAndGroupsCount > 0) {
                    consoleLog(`Leaving only presence channels which doesn't require presence leave. Ignoring leave request.`, client);
                }
                else {
                    consoleLog(`Specified channels and groups still in use by other clients: ${clientIds}. Ignoring leave request.`, client);
                }
            }
            return undefined;
        }
        // Update aggregated heartbeat state object.
        if (client && serviceHeartbeatRequests[client.subscriptionKey] && (channels.length || channelGroups.length)) {
            const hbRequestsBySubscriptionKey = serviceHeartbeatRequests[client.subscriptionKey];
            const heartbeatRequestKey = `${client.userId}_${(_a = clientAggregateAuthKey(client)) !== null && _a !== void 0 ? _a : ''}`;
            if (hbRequestsBySubscriptionKey[heartbeatRequestKey]) {
                let { channels: hbChannels, channelGroups: hbChannelGroups } = hbRequestsBySubscriptionKey[heartbeatRequestKey];
                if (channelGroups.length)
                    hbChannelGroups = hbChannelGroups.filter((group) => !channels.includes(group));
                if (channels.length)
                    hbChannels = hbChannels.filter((channel) => !channels.includes(channel));
                hbRequestsBySubscriptionKey[heartbeatRequestKey].channelGroups = hbChannelGroups;
                hbRequestsBySubscriptionKey[heartbeatRequestKey].channels = hbChannels;
            }
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
        // Update `auth` key (if required).
        if (clients.length > 1 && request.queryParameters && request.queryParameters.auth) {
            const aggregatedAuthKey = authKeyForAggregatedClientsRequest(clients);
            if (aggregatedAuthKey)
                request.queryParameters.auth = aggregatedAuthKey;
        }
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
        catch (error) {
            if (client.workerLogVerbosity)
                console.error(`[SharedWorker] Unable send message using message port: ${error}`);
        }
        return false;
    };
    /**
     * Send request processing result event.
     *
     * @param clients - List of PubNub clients which should be notified about request result.
     * @param fetchRequest - Actual request which has been used with `fetch` API.
     * @param response - PubNub service response.
     * @param request - Processed request information.
     * @param [result] - Explicit request processing result which should be notified.
     */
    const notifyRequestProcessingResult = (clients, fetchRequest, response, request, result) => {
        var _a, _b;
        if (clients.length === 0)
            return;
        if (!result && !response)
            return;
        const workerLogVerbosity = clients.some((client) => client && client.workerLogVerbosity);
        const clientIds = (_a = sharedWorkerClients[clients[0].subscriptionKey]) !== null && _a !== void 0 ? _a : {};
        const isSubscribeRequest = request.path.startsWith('/v2/subscribe');
        if (!result && response) {
            result =
                response[0].status >= 400
                    ? // Treat 4xx and 5xx status codes as errors.
                        requestProcessingError(undefined, response)
                    : requestProcessingSuccess(response);
        }
        const headers = {};
        let body;
        let status = 200;
        // Compose request response object.
        if (response) {
            body = response[1].byteLength > 0 ? response[1] : undefined;
            const { headers: requestHeaders } = response[0];
            status = response[0].status;
            // Copy Headers object content into plain Record.
            requestHeaders.forEach((value, key) => (headers[key] = value.toLowerCase()));
        }
        const transportResponse = { status, url: fetchRequest.url, headers, body };
        // Notify about subscribe and leave requests completion.
        if (workerLogVerbosity && request && !request.path.endsWith('/heartbeat')) {
            const notifiedClientIds = clients
                .reduce((identifiers, { clientIdentifier }) => {
                identifiers.push(clientIdentifier);
                return identifiers;
            }, [])
                .join(', ');
            const endpoint = isSubscribeRequest ? 'subscribe' : 'leave';
            const message = `Notify clients about ${endpoint} request completion: ${notifiedClientIds}`;
            for (const client of clients)
                consoleLog(message, client);
        }
        for (const client of clients) {
            if (isSubscribeRequest && !client.subscription) {
                // Notifying about client with inactive subscription.
                if (workerLogVerbosity) {
                    const message = `${client.clientIdentifier} doesn't have active subscription. Don't notify about completion.`;
                    for (const nClient of clients)
                        consoleLog(message, nClient);
                }
                continue;
            }
            const serviceWorkerClientId = clientIds[client.clientIdentifier];
            const { request: clientRequest } = (_b = client.subscription) !== null && _b !== void 0 ? _b : {};
            let decidedRequest = clientRequest !== null && clientRequest !== void 0 ? clientRequest : request;
            if (!isSubscribeRequest)
                decidedRequest = request;
            if (serviceWorkerClientId && decidedRequest) {
                const payload = Object.assign(Object.assign({}, result), { clientIdentifier: client.clientIdentifier, identifier: decidedRequest.identifier, url: `${decidedRequest.origin}${decidedRequest.path}` });
                if (result.type === 'request-process-success' && client.workerLogVerbosity)
                    consoleLog({ messageType: 'network-response', message: transportResponse }, client);
                else if (result.type === 'request-process-error' && client.workerLogVerbosity) {
                    const canceled = result.error ? result.error.type === 'TIMEOUT' || result.error.type === 'ABORTED' : false;
                    let details = result.error ? result.error.message : 'Unknown';
                    if (payload.response) {
                        const contentType = payload.response.headers['content-type'];
                        if (payload.response.body &&
                            contentType &&
                            (contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1)) {
                            try {
                                const serviceResponse = JSON.parse(new TextDecoder().decode(payload.response.body));
                                if ('message' in serviceResponse)
                                    details = serviceResponse.message;
                                else if ('error' in serviceResponse) {
                                    if (typeof serviceResponse.error === 'string')
                                        details = serviceResponse.error;
                                    else if (typeof serviceResponse.error === 'object' && 'message' in serviceResponse.error)
                                        details = serviceResponse.error.message;
                                }
                            }
                            catch (_) { }
                        }
                        if (details === 'Unknown') {
                            if (payload.response.status >= 500)
                                details = 'Internal Server Error';
                            else if (payload.response.status == 400)
                                details = 'Bad request';
                            else if (payload.response.status == 403)
                                details = 'Access denied';
                            else
                                details = `${payload.response.status}`;
                        }
                    }
                    consoleLog({
                        messageType: 'network-request',
                        message: request,
                        details,
                        canceled,
                        failed: !canceled,
                    }, client);
                }
                publishClientEvent(client, payload);
            }
            else if (!serviceWorkerClientId && workerLogVerbosity) {
                // Notifying about client without Shared Worker's communication channel.
                const message = `${client.clientIdentifier} doesn't have Shared Worker's communication channel. Don't notify about completion.`;
                for (const nClient of clients) {
                    if (nClient.clientIdentifier !== client.clientIdentifier)
                        consoleLog(message, nClient);
                }
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
        // Use service response as error information source.
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
        const errorMessage = message.toLowerCase();
        if (errorMessage.includes('timeout'))
            type = 'TIMEOUT';
        else if (name === 'AbortError' || errorMessage.includes('aborted') || errorMessage.includes('cancel')) {
            message = 'Request aborted';
            type = 'ABORTED';
        }
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
        var _a, _b, _c;
        var _d, _e;
        const { clientIdentifier } = event;
        if (pubNubClients[clientIdentifier])
            return;
        const client = (pubNubClients[clientIdentifier] = {
            clientIdentifier,
            subscriptionKey: event.subscriptionKey,
            userId: event.userId,
            heartbeatInterval: event.heartbeatInterval,
            newlyRegistered: true,
            offlineClientsCheckInterval: event.workerOfflineClientsCheckInterval,
            unsubscribeOfflineClients: event.workerUnsubscribeOfflineClients,
            workerLogVerbosity: event.workerLogVerbosity,
        });
        // Map registered PubNub client to its subscription key.
        const clientsBySubscriptionKey = ((_a = pubNubClientsBySubscriptionKey[_d = event.subscriptionKey]) !== null && _a !== void 0 ? _a : (pubNubClientsBySubscriptionKey[_d] = []));
        if (clientsBySubscriptionKey.every((entry) => entry.clientIdentifier !== clientIdentifier))
            clientsBySubscriptionKey.push(client);
        // Binding PubNub client to the MessagePort (receiver).
        ((_b = sharedWorkerClients[_e = event.subscriptionKey]) !== null && _b !== void 0 ? _b : (sharedWorkerClients[_e] = {}))[clientIdentifier] = event.port;
        const message = `Registered PubNub client with '${clientIdentifier}' identifier. ` +
            `'${clientsBySubscriptionKey.length}' clients currently active.`;
        for (const _client of clientsBySubscriptionKey)
            consoleLog(message, _client);
        if (!pingTimeouts[event.subscriptionKey] &&
            ((_c = pubNubClientsBySubscriptionKey[event.subscriptionKey]) !== null && _c !== void 0 ? _c : []).length > 0) {
            const { subscriptionKey } = event;
            const interval = event.workerOfflineClientsCheckInterval;
            for (const _client of clientsBySubscriptionKey)
                consoleLog(`Setup PubNub client ping event ${interval} seconds`, _client);
            pingTimeouts[subscriptionKey] = setTimeout(() => pingClients(subscriptionKey), interval * 500 - 1);
        }
    };
    /**
     * Update configuration of previously registered PubNub client.
     *
     * @param event - Object with up-to-date client settings, which should be reflected in SharedWorker's state for the
     * registered client.
     */
    const updateClientInformation = (event) => {
        var _a, _b, _c;
        const { clientIdentifier, userId, heartbeatInterval, accessToken: authKey, preProcessedToken: token } = event;
        const client = pubNubClients[clientIdentifier];
        // This should never happen.
        if (!client)
            return;
        consoleDir({ userId, heartbeatInterval, authKey, token }, `Update client configuration:`, client);
        // Check whether identity changed as part of configuration update or not.
        if (userId !== client.userId || (authKey && authKey !== ((_a = client.authKey) !== null && _a !== void 0 ? _a : ''))) {
            const _heartbeatRequests = (_b = serviceHeartbeatRequests[client.subscriptionKey]) !== null && _b !== void 0 ? _b : {};
            const heartbeatRequestKey = `${userId}_${(_c = clientAggregateAuthKey(client)) !== null && _c !== void 0 ? _c : ''}`;
            // Clean up previous heartbeat aggregation data.
            if (_heartbeatRequests[heartbeatRequestKey] !== undefined)
                delete _heartbeatRequests[heartbeatRequestKey];
        }
        const intervalChanged = client.heartbeatInterval !== heartbeatInterval;
        // Updating client configuration.
        client.userId = userId;
        client.heartbeatInterval = heartbeatInterval;
        if (authKey)
            client.authKey = authKey;
        if (token)
            client.accessToken = token;
        if (intervalChanged)
            startHeartbeatTimer(client, true);
        updateCachedRequestAuthKeys(client);
        // Make immediate heartbeat call (if possible).
        if (!client.heartbeat || !client.heartbeat.heartbeatEvent)
            return;
        handleHeartbeatRequestEvent(client.heartbeat.heartbeatEvent, false, true);
    };
    /**
     * Unregister client if it uses Service Worker before.
     *
     * During registration removal client information will be removed from the Shared Worker and
     * long-poll request will be cancelled if possible.
     *
     * @param event - Base information about PubNub client instance and Service Worker {@link Client}.
     */
    const unRegisterClient = (event) => {
        invalidateClient(event.subscriptionKey, event.clientIdentifier);
    };
    /**
     * Update information about previously registered client.
     *
     * Use information from request to populate list of channels and other useful information.
     *
     * @param event - Send request.
     * @returns `true` if channels / groups list has been changed. May return `undefined` because `client` is missing.
     */
    const updateClientSubscribeStateIfRequired = (event) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        var _m, _o, _p, _q, _r, _s, _t, _u, _v;
        const query = event.request.queryParameters;
        const { clientIdentifier } = event;
        const client = pubNubClients[clientIdentifier];
        let changed = false;
        // This should never happen.
        if (!client)
            return;
        const channelGroupQuery = ((_a = query['channel-group']) !== null && _a !== void 0 ? _a : '');
        const state = ((_b = query.state) !== null && _b !== void 0 ? _b : '');
        let subscription = client.subscription;
        if (!subscription) {
            changed = true;
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
            const _channelsFromRequest = channelsFromRequest(event.request);
            if (!changed)
                changed = !includesStrings(subscription.channels, _channelsFromRequest);
            subscription.channels = _channelsFromRequest;
        }
        if (subscription.channelGroupQuery !== channelGroupQuery) {
            subscription.channelGroupQuery = channelGroupQuery;
            const _channelGroupsFromRequest = channelGroupsFromRequest(event.request);
            if (!changed)
                changed = !includesStrings(subscription.channelGroups, _channelGroupsFromRequest);
            subscription.channelGroups = _channelGroupsFromRequest;
        }
        let { authKey } = client;
        subscription.request = event.request;
        subscription.filterExpression = ((_j = query['filter-expr']) !== null && _j !== void 0 ? _j : '');
        subscription.timetoken = ((_k = query.tt) !== null && _k !== void 0 ? _k : '0');
        if (query.tr !== undefined)
            subscription.region = query.tr;
        client.authKey = ((_l = query.auth) !== null && _l !== void 0 ? _l : '');
        client.origin = event.request.origin;
        client.userId = query.uuid;
        client.pnsdk = query.pnsdk;
        client.accessToken = event.preProcessedToken;
        if (client.newlyRegistered && !authKey && client.authKey)
            authKey = client.authKey;
        client.newlyRegistered = false;
        return changed;
    };
    /**
     * Update presence heartbeat information for previously registered client.
     *
     * Use information from request to populate list of channels / groups and presence state information.
     *
     * @param event - Send heartbeat request event.
     */
    const updateClientHeartbeatState = (event) => {
        var _a, _b, _c;
        const { clientIdentifier } = event;
        const client = pubNubClients[clientIdentifier];
        const { request } = event;
        const query = (_a = request.queryParameters) !== null && _a !== void 0 ? _a : {};
        // This should never happen.
        if (!client)
            return;
        const _clientHeartbeat = ((_b = client.heartbeat) !== null && _b !== void 0 ? _b : (client.heartbeat = {
            channels: [],
            channelGroups: [],
        }));
        _clientHeartbeat.heartbeatEvent = Object.assign({}, event);
        // Update presence heartbeat information about client.
        _clientHeartbeat.channelGroups = channelGroupsFromRequest(request).filter((group) => !group.endsWith('-pnpres'));
        _clientHeartbeat.channels = channelsFromRequest(request).filter((channel) => !channel.endsWith('-pnpres'));
        const state = ((_c = query.state) !== null && _c !== void 0 ? _c : '');
        if (state.length > 0) {
            const userPresenceState = JSON.parse(state);
            for (const objectName of Object.keys(userPresenceState))
                if (!_clientHeartbeat.channels.includes(objectName) && !_clientHeartbeat.channelGroups.includes(objectName))
                    delete userPresenceState[objectName];
            _clientHeartbeat.presenceState = userPresenceState;
        }
        client.accessToken = event.preProcessedToken;
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
        var _a, _b, _c;
        const invalidatedClient = pubNubClients[clientId];
        delete pubNubClients[clientId];
        let clients = pubNubClientsBySubscriptionKey[subscriptionKey];
        let serviceRequestId;
        // Unsubscribe invalidated PubNub client.
        if (invalidatedClient) {
            // Cancel long-poll request if possible.
            if (invalidatedClient.subscription) {
                serviceRequestId = invalidatedClient.subscription.serviceRequestId;
                delete invalidatedClient.subscription.serviceRequestId;
                if (serviceRequestId)
                    cancelRequest(serviceRequestId);
            }
            // Make sure to stop heartbeat timer.
            stopHeartbeatTimer(invalidatedClient);
            if (serviceHeartbeatRequests[subscriptionKey]) {
                const hbRequestsBySubscriptionKey = ((_a = serviceHeartbeatRequests[subscriptionKey]) !== null && _a !== void 0 ? _a : (serviceHeartbeatRequests[subscriptionKey] = {}));
                const heartbeatRequestKey = `${invalidatedClient.userId}_${(_b = clientAggregateAuthKey(invalidatedClient)) !== null && _b !== void 0 ? _b : ''}`;
                if (hbRequestsBySubscriptionKey[heartbeatRequestKey] &&
                    hbRequestsBySubscriptionKey[heartbeatRequestKey].clientIdentifier === invalidatedClient.clientIdentifier)
                    delete hbRequestsBySubscriptionKey[heartbeatRequestKey].clientIdentifier;
            }
            // Leave subscribed channels / groups properly.
            if (invalidatedClient.unsubscribeOfflineClients)
                unsubscribeClient(invalidatedClient, serviceRequestId);
        }
        if (clients) {
            // Clean up linkage between client and subscription key.
            clients = clients.filter((client) => client.clientIdentifier !== clientId);
            if (clients.length > 0)
                pubNubClientsBySubscriptionKey[subscriptionKey] = clients;
            else {
                delete pubNubClientsBySubscriptionKey[subscriptionKey];
                delete serviceHeartbeatRequests[subscriptionKey];
            }
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
        const message = `Invalidate '${clientId}' client. '${((_c = pubNubClientsBySubscriptionKey[subscriptionKey]) !== null && _c !== void 0 ? _c : []).length}' clients currently active.`;
        if (!clients)
            consoleLog(message);
        else
            for (const _client of clients)
                consoleLog(message, _client);
    };
    /**
     * Unsubscribe offline / invalidated PubNub client.
     *
     * @param client - Invalidated PubNub client state object.
     * @param [invalidatedClientServiceRequestId] - Identifier of the service request ID for which the invalidated
     * client waited for a subscribe response.
     */
    const unsubscribeClient = (client, invalidatedClientServiceRequestId) => {
        if (!client.subscription)
            return;
        const { channels, channelGroups } = client.subscription;
        const encodedChannelGroups = (channelGroups !== null && channelGroups !== void 0 ? channelGroups : [])
            .filter((name) => !name.endsWith('-pnpres'))
            .map((name) => encodeString(name))
            .sort();
        const encodedChannels = (channels !== null && channels !== void 0 ? channels : [])
            .filter((name) => !name.endsWith('-pnpres'))
            .map((name) => encodeString(name))
            .sort();
        if (encodedChannels.length === 0 && encodedChannelGroups.length === 0)
            return;
        const channelGroupsString = encodedChannelGroups.length > 0 ? encodedChannelGroups.join(',') : undefined;
        const channelsString = encodedChannels.length === 0 ? ',' : encodedChannels.join(',');
        const query = Object.assign(Object.assign({ instanceid: client.clientIdentifier, uuid: client.userId, requestid: uuidGenerator.createUUID() }, (client.authKey ? { auth: client.authKey } : {})), (channelGroupsString ? { 'channel-group': channelGroupsString } : {}));
        const request = {
            type: 'send-request',
            clientIdentifier: client.clientIdentifier,
            subscriptionKey: client.subscriptionKey,
            request: {
                origin: client.origin,
                path: `/v2/presence/sub-key/${client.subscriptionKey}/channel/${channelsString}/leave`,
                queryParameters: query,
                method: TransportMethod.GET,
                headers: {},
                timeout: 10,
                cancellable: false,
                compressible: false,
                identifier: query.requestid,
            },
        };
        handleSendLeaveRequestEvent(request, client, invalidatedClientServiceRequestId);
    };
    /**
     * Start presence heartbeat timer for periodic `heartbeat` API calls.
     *
     * @param client - Client state with information for heartbeat.
     * @param [adjust] - Whether timer fire timer should be re-adjusted or not.
     */
    const startHeartbeatTimer = (client, adjust = false) => {
        const { heartbeat, heartbeatInterval } = client;
        if (heartbeat === undefined || !heartbeat.heartbeatEvent)
            return;
        // Check whether there is a need to run "backup" heartbeat timer or not.
        if (!heartbeatInterval || heartbeatInterval === 0) {
            stopHeartbeatTimer(client);
            return;
        }
        // Check whether there is active timer which should be re-adjusted or not.
        if (adjust && !heartbeat.loop)
            return;
        let targetInterval = heartbeatInterval;
        if (adjust && heartbeat.loop && targetInterval !== heartbeat.loop.heartbeatInterval) {
            const activeTime = (Date.now() - heartbeat.loop.startTimestamp) / 1000;
            if (activeTime < targetInterval)
                targetInterval -= activeTime;
        }
        stopHeartbeatTimer(client);
        if (targetInterval <= 0)
            return;
        heartbeat.loop = {
            timer: setTimeout(() => {
                stopHeartbeatTimer(client);
                if (!client.heartbeat || !client.heartbeat.heartbeatEvent)
                    return;
                // Generate new request ID
                const { request } = client.heartbeat.heartbeatEvent;
                request.identifier = uuidGenerator.createUUID();
                request.queryParameters.requestid = request.identifier;
                handleHeartbeatRequestEvent(client.heartbeat.heartbeatEvent, false);
            }, targetInterval * 1000),
            heartbeatInterval,
            startTimestamp: Date.now(),
        };
    };
    /**
     * Stop presence heartbeat timer before it will fire.
     *
     * @param client - Client state for which presence heartbeat timer should be stopped.
     */
    const stopHeartbeatTimer = (client) => {
        const { heartbeat } = client;
        if (heartbeat === undefined || !heartbeat.loop)
            return;
        clearTimeout(heartbeat.loop.timer);
        delete heartbeat.loop;
    };
    /**
     * Refresh authentication key stored in cached `subscribe` and `heartbeat` requests.
     *
     * @param client - Client state for which cached requests should be updated.
     */
    const updateCachedRequestAuthKeys = (client) => {
        var _a, _b;
        var _c;
        const { subscription, heartbeat } = client;
        // Update `auth` query for cached subscribe request (if required).
        if (subscription && subscription.request && subscription.request.queryParameters) {
            const query = subscription.request.queryParameters;
            if (client.authKey && client.authKey.length > 0)
                query.auth = client.authKey;
            else if (query.auth)
                delete query.auth;
        }
        // Update `auth` query for cached heartbeat request (if required).
        if ((heartbeat === null || heartbeat === void 0 ? void 0 : heartbeat.heartbeatEvent) && heartbeat.heartbeatEvent.request) {
            if (client.accessToken)
                heartbeat.heartbeatEvent.preProcessedToken = client.accessToken;
            const hbRequestsBySubscriptionKey = ((_a = serviceHeartbeatRequests[_c = client.subscriptionKey]) !== null && _a !== void 0 ? _a : (serviceHeartbeatRequests[_c] = {}));
            const heartbeatRequestKey = `${client.userId}_${(_b = clientAggregateAuthKey(client)) !== null && _b !== void 0 ? _b : ''}`;
            if (hbRequestsBySubscriptionKey[heartbeatRequestKey] && hbRequestsBySubscriptionKey[heartbeatRequestKey].response)
                delete hbRequestsBySubscriptionKey[heartbeatRequestKey].response;
            // Generate new request ID
            heartbeat.heartbeatEvent.request.identifier = uuidGenerator.createUUID();
            const query = heartbeat.heartbeatEvent.request.queryParameters;
            query.requestid = heartbeat.heartbeatEvent.request.identifier;
            if (client.authKey && client.authKey.length > 0)
                query.auth = client.authKey;
            else if (query.auth)
                delete query.auth;
        }
    };
    /**
     * Validate received event payload.
     */
    const validateEventPayload = (event) => {
        const { clientIdentifier, subscriptionKey } = event.data;
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
        var _a, _b;
        const reqClient = pubNubClients[event.clientIdentifier];
        if (!reqClient)
            return [];
        const query = event.request.queryParameters;
        const authKey = clientAggregateAuthKey(reqClient);
        const filterExpression = ((_a = query['filter-expr']) !== null && _a !== void 0 ? _a : '');
        const userId = query.uuid;
        return ((_b = pubNubClientsBySubscriptionKey[event.subscriptionKey]) !== null && _b !== void 0 ? _b : []).filter((client) => client.userId === userId &&
            clientAggregateAuthKey(client) === authKey &&
            client.subscription &&
            // Only clients with active subscription can be used.
            (client.subscription.channels.length !== 0 || client.subscription.channelGroups.length !== 0) &&
            client.subscription.filterExpression === filterExpression &&
            (timetoken === '0' || client.subscription.timetoken === '0' || client.subscription.timetoken === timetoken));
    };
    /**
     * Find PubNub client state with configuration compatible with toe one in request.
     *
     * Method allow to find information about all PubNub client instances which use same:
     * - subscription key
     * - `userId`
     * - `auth` key
     *
     * @param event - Send heartbeat request event information.
     *
     * @returns List of PubNub client states which works from other pages for the same user.
     */
    const clientsForSendHeartbeatRequestEvent = (event) => {
        return clientsForSendLeaveRequestEvent(event);
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
     * @param [invalidatedClient] - Invalidated PubNub client state.
     *
     * @returns List of PubNub client states which works from other pages for the same user.
     */
    const clientsForSendLeaveRequestEvent = (event, invalidatedClient) => {
        var _a;
        const reqClient = invalidatedClient !== null && invalidatedClient !== void 0 ? invalidatedClient : pubNubClients[event.clientIdentifier];
        if (!reqClient)
            return [];
        const query = event.request.queryParameters;
        const authKey = clientAggregateAuthKey(reqClient);
        const userId = query.uuid;
        return ((_a = pubNubClientsBySubscriptionKey[event.subscriptionKey]) !== null && _a !== void 0 ? _a : []).filter((client) => client.userId === userId && clientAggregateAuthKey(client) === authKey);
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
     *
     * @param subscriptionKey - Subscribe key for which offline PubNub client should be checked.
     */
    const pingClients = (subscriptionKey) => {
        const payload = { type: 'shared-worker-ping' };
        const _pubNubClients = Object.values(pubNubClients).filter((client) => client && client.subscriptionKey === subscriptionKey);
        _pubNubClients.forEach((client) => {
            let clientInvalidated = false;
            if (client && client.lastPingRequest) {
                const interval = client.offlineClientsCheckInterval;
                // Check whether client never respond or last response was too long time ago.
                if (!client.lastPongEvent || Math.abs(client.lastPongEvent - client.lastPingRequest) > interval * 0.5) {
                    clientInvalidated = true;
                    for (const _client of _pubNubClients)
                        consoleLog(`'${client.clientIdentifier}' client is inactive. Invalidating...`, _client);
                    invalidateClient(client.subscriptionKey, client.clientIdentifier);
                }
            }
            if (client && !clientInvalidated) {
                client.lastPingRequest = new Date().getTime() / 1000;
                publishClientEvent(client, payload);
            }
        });
        // Restart ping timer if there is still active PubNub clients for subscription key.
        if (_pubNubClients && _pubNubClients.length > 0 && _pubNubClients[0]) {
            const interval = _pubNubClients[0].offlineClientsCheckInterval;
            pingTimeouts[subscriptionKey] = setTimeout(() => pingClients(subscriptionKey), interval * 500 - 1);
        }
    };
    /**
     * Retrieve auth key which is suitable for common clients request aggregation.
     *
     * @param client - Client for which auth key for aggregation should be retrieved.
     *
     * @returns Client aggregation auth key.
     */
    const clientAggregateAuthKey = (client) => {
        var _a;
        return client.accessToken ? ((_a = client.accessToken.token) !== null && _a !== void 0 ? _a : client.authKey) : client.authKey;
    };
    /**
     * Pick auth key for clients with latest expiration date.
     *
     * @param clients - List of clients for which latest auth key should be retrieved.
     *
     * @returns Access token which can be used to confirm `userId` permissions for aggregated request.
     */
    const authKeyForAggregatedClientsRequest = (clients) => {
        const latestClient = clients
            .filter((client) => !!client.accessToken)
            .sort((a, b) => a.accessToken.expiration - b.accessToken.expiration)
            .pop();
        return latestClient ? latestClient.authKey : undefined;
    };
    /**
     * Compose clients' aggregation key.
     *
     * Aggregation key includes key parameters which differentiate clients between each other.
     *
     * @param client - Client for which identifier should be composed.
     *
     * @returns Aggregation timeout identifier string.
     */
    const aggregateTimerId = (client) => {
        const authKey = clientAggregateAuthKey(client);
        let id = `${client.userId}-${client.subscriptionKey}${authKey ? `-${authKey}` : ''}`;
        if (client.subscription && client.subscription.filterExpression)
            id += `-${client.subscription.filterExpression}`;
        return id;
    };
    /**
     * Print message on the worker's clients console.
     *
     * @param message - Message which should be printed.
     * @param [client] - Target client to which log message should be sent.
     */
    const consoleLog = (message, client) => {
        const clients = (client ? [client] : Object.values(pubNubClients)).filter((client) => client && client.workerLogVerbosity);
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
        const clients = (client ? [client] : Object.values(pubNubClients)).filter((client) => client && client.workerLogVerbosity);
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
