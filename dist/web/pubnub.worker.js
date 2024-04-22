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
    // region State
    /**
     * Service `ArrayBuffer` response decoder.
     */
    const decoder = new TextDecoder();
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
     * Per-subscription key map of client identifiers to the Service Worker {@link Client} identifier.
     *
     * Service Worker {@link Client} represent pages at which PubNub clients registered Service Workers.
     */
    const serviceWorkerClients = {};
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
     * Listen for Service Worker activation.
     */
    self.addEventListener('activate', (event) => {
        event.waitUntil(self.clients.claim());
    });
    /**
     * Listen for events from the client.
     */
    self.addEventListener('message', (event) => {
        // Ignoring requests sent from other service workers.
        if (!validateEventPayload(event))
            return;
        const data = event.data;
        if (data.type === 'send-request') {
            if (data.request.path.startsWith('/v2/subscribe')) {
                registerClientIfRequired(event);
                handleSendSubscribeRequestEvent(data);
            }
            else {
                if (!pubNubClients[data.clientIdentifier])
                    registerClientIfRequired(event);
                handleSendLeaveRequestEvent(event);
            }
        }
        else if (data.type === 'cancel-request')
            handleCancelRequestEvent(data);
    });
    /**
     * Handle client request to send subscription request.
     *
     * @param event - Subscription event details.
     */
    const handleSendSubscribeRequestEvent = (event) => {
        const requestOrId = subscribeTransportRequestFromEvent(event);
        const client = pubNubClients[event.clientIdentifier];
        if (client)
            notifyRequestProcessing('start', [client], new Date().toISOString());
        if (typeof requestOrId === 'string') {
            if (client) {
                // Updating client timetoken information.
                client.subscription.previousTimetoken = client.subscription.timetoken;
                client.subscription.timetoken = serviceRequests[requestOrId].timetoken;
                client.subscription.serviceRequestId = requestOrId;
            }
            return;
        }
        if (event.request.cancellable)
            abortControllers.set(requestOrId.identifier, new AbortController());
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
        });
    };
    /**
     * Handle client request to leave request.
     *
     * @param event - Leave event details.
     */
    const handleSendLeaveRequestEvent = (event) => {
        const data = event.data;
        const request = leaveTransportRequestFromEvent(data);
        const client = pubNubClients[data.clientIdentifier];
        if (!client)
            return;
        if (!request) {
            const body = new TextEncoder().encode('{"status": 200, "action": "leave", "message": "OK", "service":"Presence"}');
            const headers = new Headers({ 'Content-Type': 'text/javascript; charset="UTF-8"', 'Content-Length': '74' });
            const response = new Response(body, { status: 200, headers });
            const result = requestProcessingSuccess([response, body]);
            result.url = `${data.request.origin}${data.request.path}`;
            result.clientIdentifier = data.clientIdentifier;
            result.identifier = data.request.identifier;
            publishClientEvent(event.source.id, result).then((sent) => {
                if (sent)
                    invalidateClient(client.subscriptionKey, client.clientIdentifier, client.userId);
            });
            return;
        }
        sendRequest(request, () => [client], (clients, response) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, response, data.request);
        }, (clients, error) => {
            // Notify each PubNub client which awaited for response.
            notifyRequestProcessingResult(clients, null, data.request, requestProcessingError(error));
        });
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
        const serviceRequestId = client ? client.subscription.serviceRequestId : undefined;
        if (!client || !serviceRequestId)
            return;
        // Unset awaited requests.
        delete client.subscription.serviceRequestId;
        delete client.subscription.request;
        if (clientsForRequest(serviceRequestId).length === 0) {
            const controller = abortControllers.get(serviceRequestId);
            abortControllers.delete(serviceRequestId);
            // Clean up scheduled requests.
            delete serviceRequests[serviceRequestId];
            // Abort request if possible.
            if (controller)
                controller.abort();
        }
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
     */
    const sendRequest = (request, getClients, success, failure) => {
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
        return Object.values(pubNubClients).filter((client) => client !== undefined && client.subscription.serviceRequestId === identifier);
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
            delete client.subscription.request;
            delete client.subscription.serviceRequestId;
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
        var _a, _b, _c, _d;
        const client = pubNubClients[event.clientIdentifier];
        const clients = clientsForSendSubscribeRequestEvent(client.subscription.previousTimetoken, event);
        const serviceRequestId = uuidGenerator.createUUID();
        const request = Object.assign({}, event.request);
        if (clients.length > 1) {
            const activeRequestId = activeSubscriptionForEvent(clients, event);
            // Return identifier of the ongoing request.
            if (activeRequestId)
                return activeRequestId;
            const state = ((_a = presenceState[client.subscriptionKey]) !== null && _a !== void 0 ? _a : {})[client.userId];
            const aggregatedState = {};
            const channelGroups = new Set(client.subscription.channelGroups);
            const channels = new Set(client.subscription.channels);
            if (state && client.subscription.objectsWithState.length) {
                client.subscription.objectsWithState.forEach((name) => {
                    const objectState = state[name];
                    if (objectState)
                        aggregatedState[name] = objectState;
                });
            }
            for (const client of clients) {
                const { subscription } = client;
                // Skip clients which already have active subscription request.
                if (subscription.serviceRequestId)
                    continue;
                subscription.channelGroups.forEach(channelGroups.add, channelGroups);
                subscription.channels.forEach(channels.add, channels);
                // Set awaited service worker request identifier.
                subscription.serviceRequestId = serviceRequestId;
                if (!state)
                    continue;
                subscription.objectsWithState.forEach((name) => {
                    const objectState = state[name];
                    if (objectState && !aggregatedState[name])
                        aggregatedState[name] = objectState;
                });
            }
            const serviceRequest = ((_b = serviceRequests[serviceRequestId]) !== null && _b !== void 0 ? _b : (serviceRequests[serviceRequestId] = {
                requestId: serviceRequestId,
                timetoken: (_c = request.queryParameters.tt) !== null && _c !== void 0 ? _c : '0',
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
                timetoken: (_d = request.queryParameters.tt) !== null && _d !== void 0 ? _d : '0',
                channelGroups: client.subscription.channelGroups,
                channels: client.subscription.channels,
            };
        }
        client.subscription.serviceRequestId = serviceRequestId;
        request.identifier = serviceRequestId;
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
        if (client) {
            const { subscription } = client;
            if (channels.length)
                subscription.channels = subscription.channels.filter((channel) => !channels.includes(channel));
            if (channelGroups.length) {
                subscription.channelGroups = subscription.channelGroups.filter((group) => !channelGroups.includes(group));
            }
        }
        // Filter out channels and groups which is still in use by the other PubNub client instances.
        for (const client of clients) {
            if (client.clientIdentifier === event.clientIdentifier)
                continue;
            if (channels.length)
                channels = channels.filter((channel) => !client.subscription.channels.includes(channel));
            if (channelGroups.length)
                channelGroups = channelGroups.filter((group) => !client.subscription.channelGroups.includes(group));
        }
        if (channels.length === 0 && channelGroups.length === 0)
            return undefined;
        // Update request channels list (if required).
        if (channels.length) {
            const pathComponents = request.path.split('/');
            pathComponents[4] = channels.join(',');
            request.path = pathComponents.join('/');
        }
        // Update request channel groups list (if required).
        if (channelGroups.length)
            request.queryParameters['channel-group'] = channelGroups.join(',');
        return request;
    };
    /**
     * Send event to all service worker clients.
     *
     * @param identifier - Service Worker receiving {@link Client} identifier.
     * @param event - Service worker event object.
     */
    const publishClientEvent = (identifier, event) => {
        return self.clients.get(identifier).then((client) => {
            if (!client)
                return false;
            client.postMessage(event);
            return true;
        });
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
        const clientIds = (_a = serviceWorkerClients[clients[0].subscriptionKey]) !== null && _a !== void 0 ? _a : {};
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
        clients.forEach((client) => {
            const serviceWorkerClientId = clientIds[client.clientIdentifier];
            const { request: clientRequest } = client.subscription;
            const decidedRequest = clientRequest !== null && clientRequest !== void 0 ? clientRequest : request;
            if (client.logVerbosity && serviceWorkerClientId && decidedRequest) {
                publishClientEvent(serviceWorkerClientId, Object.assign(Object.assign({}, event), { clientIdentifier: client.clientIdentifier, url: `${decidedRequest.origin}${decidedRequest.path}`, query: decidedRequest.queryParameters })).then((sent) => {
                    if (sent)
                        invalidateClient(client.subscriptionKey, client.clientIdentifier, client.userId);
                });
            }
        });
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
        const clientIds = (_a = serviceWorkerClients[clients[0].subscriptionKey]) !== null && _a !== void 0 ? _a : {};
        if (!result && response) {
            result =
                response[0].status >= 400
                    ? // Treat 4xx and 5xx status codes as errors.
                        requestProcessingError(undefined, response)
                    : requestProcessingSuccess(response);
        }
        clients.forEach((client) => {
            const serviceWorkerClientId = clientIds[client.clientIdentifier];
            const { request: clientRequest } = client.subscription;
            const decidedRequest = clientRequest !== null && clientRequest !== void 0 ? clientRequest : request;
            if (serviceWorkerClientId && decidedRequest) {
                publishClientEvent(serviceWorkerClientId, Object.assign(Object.assign({}, result), { clientIdentifier: client.clientIdentifier, identifier: decidedRequest.identifier, url: `${decidedRequest.origin}${decidedRequest.path}` })).then((sent) => {
                    if (sent)
                        invalidateClient(client.subscriptionKey, client.clientIdentifier, client.userId);
                });
            }
        });
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        var _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5;
        const information = event.data;
        const { clientIdentifier } = information;
        const query = information.request.queryParameters;
        let client = pubNubClients[clientIdentifier];
        if (!client) {
            const isPresenceLeave = !information.request.path.startsWith('/v2/subscribe');
            const channelGroupQuery = !isPresenceLeave ? ((_a = query['channel-group']) !== null && _a !== void 0 ? _a : '') : '';
            const state = !isPresenceLeave ? ((_b = query.state) !== null && _b !== void 0 ? _b : '') : '';
            client = pubNubClients[clientIdentifier] = {
                clientIdentifier,
                subscriptionKey: information.subscriptionKey,
                userId: query.uuid,
                authKey: ((_c = query.auth) !== null && _c !== void 0 ? _c : ''),
                logVerbosity: information.logVerbosity,
                subscription: {
                    path: !isPresenceLeave ? information.request.path : '',
                    channelGroupQuery: !isPresenceLeave ? channelGroupQuery : '',
                    channels: !isPresenceLeave ? channelsFromRequest(information.request) : [],
                    channelGroups: !isPresenceLeave ? channelGroupsFromRequest(information.request) : [],
                    previousTimetoken: !isPresenceLeave ? ((_d = query.tt) !== null && _d !== void 0 ? _d : '0') : '0',
                    timetoken: !isPresenceLeave ? ((_e = query.tt) !== null && _e !== void 0 ? _e : '0') : '0',
                    request: !isPresenceLeave ? information.request : undefined,
                    objectsWithState: [],
                    filterExpression: !isPresenceLeave ? ((_f = query['filter-expr']) !== null && _f !== void 0 ? _f : '') : undefined,
                },
            };
            if (!isPresenceLeave && state.length > 0) {
                const parsedState = JSON.parse(state);
                const userState = ((_h = (_w = ((_g = presenceState[_v = client.subscriptionKey]) !== null && _g !== void 0 ? _g : (presenceState[_v] = {})))[_x = client.userId]) !== null && _h !== void 0 ? _h : (_w[_x] = {}));
                Object.entries(parsedState).forEach(([objectName, value]) => (userState[objectName] = value));
                client.subscription.objectsWithState = Object.keys(parsedState);
            }
            // Map registered PubNub client to its subscription key.
            const clientsBySubscriptionKey = ((_j = pubNubClientsBySubscriptionKey[_y = information.subscriptionKey]) !== null && _j !== void 0 ? _j : (pubNubClientsBySubscriptionKey[_y] = []));
            if (clientsBySubscriptionKey.every((entry) => entry.clientIdentifier !== clientIdentifier))
                clientsBySubscriptionKey.push(client);
            // Binding PubNub client to the page (Service Worker Client).
            ((_k = serviceWorkerClients[_z = information.subscriptionKey]) !== null && _k !== void 0 ? _k : (serviceWorkerClients[_z] = {}))[clientIdentifier] = event.source.id;
        }
        else {
            const channelGroupQuery = ((_l = query['channel-group']) !== null && _l !== void 0 ? _l : '');
            const state = ((_m = query.state) !== null && _m !== void 0 ? _m : '');
            client.subscription.filterExpression = ((_o = query['filter-expr']) !== null && _o !== void 0 ? _o : '');
            client.subscription.previousTimetoken = client.subscription.timetoken;
            client.subscription.timetoken = ((_p = query.tt) !== null && _p !== void 0 ? _p : '0');
            client.subscription.request = information.request;
            client.authKey = ((_q = query.auth) !== null && _q !== void 0 ? _q : '');
            client.userId = query.uuid;
            if (client.subscription.path !== information.request.path) {
                client.subscription.path = information.request.path;
                client.subscription.channels = channelsFromRequest(information.request);
            }
            if (client.subscription.channelGroupQuery !== channelGroupQuery) {
                client.subscription.channelGroupQuery = channelGroupQuery;
                client.subscription.channelGroups = channelGroupsFromRequest(information.request);
            }
            if (state.length > 0) {
                const parsedState = JSON.parse(state);
                const userState = ((_s = (_1 = ((_r = presenceState[_0 = client.subscriptionKey]) !== null && _r !== void 0 ? _r : (presenceState[_0] = {})))[_2 = client.userId]) !== null && _s !== void 0 ? _s : (_1[_2] = {}));
                Object.entries(parsedState).forEach(([objectName, value]) => (userState[objectName] = value));
                // Clean up state for objects where presence state has been reset.
                for (const objectName of client.subscription.objectsWithState)
                    if (!parsedState[objectName])
                        delete userState[objectName];
                client.subscription.objectsWithState = Object.keys(parsedState);
            }
            // Handle potential presence state reset.
            else if (client.subscription.objectsWithState.length) {
                const userState = ((_u = (_4 = ((_t = presenceState[_3 = client.subscriptionKey]) !== null && _t !== void 0 ? _t : (presenceState[_3] = {})))[_5 = client.userId]) !== null && _u !== void 0 ? _u : (_4[_5] = {}));
                for (const objectName of client.subscription.objectsWithState)
                    delete userState[objectName];
                client.subscription.objectsWithState = [];
            }
        }
    };
    /**
     * Clean up resources used by registered PubNub client instance.
     *
     * @param subscriptionKey - Subscription key which has been used by the
     * invalidated instance.
     * @param clientId - Unique PubNub client identifier.
     * @param userId - Unique identifier of the user used by PubNub client instance.
     */
    const invalidateClient = (subscriptionKey, clientId, userId) => {
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
                const workerClients = serviceWorkerClients[subscriptionKey];
                if (workerClients) {
                    delete workerClients[clientId];
                    if (Object.keys(workerClients).length === 0)
                        delete serviceWorkerClients[subscriptionKey];
                }
            }
            else
                delete serviceWorkerClients[subscriptionKey];
        }
    };
    /**
     * Validate received event payload.
     */
    const validateEventPayload = (event) => {
        if (!event.source || !(event.source instanceof Client))
            return false;
        const data = event.data;
        const { clientIdentifier, subscriptionKey, logVerbosity } = data;
        if (logVerbosity === undefined || typeof logVerbosity !== 'boolean')
            return false;
        if (!clientIdentifier || typeof clientIdentifier !== 'string')
            return false;
        return !(!subscriptionKey || typeof subscriptionKey !== 'string');
    };
    /**
     * Search for active subscription for one of the passed {@link serviceWorkerClients}.
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
            if (!subscription.serviceRequestId)
                continue;
            if (subscription.path === requestPath && subscription.channelGroupQuery === channelGroupQuery) {
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
            client.subscription.filterExpression === filterExpression &&
            (timetoken === '0' ||
                client.subscription.previousTimetoken === '0' ||
                client.subscription.previousTimetoken === timetoken));
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
