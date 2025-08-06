(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    /**
     * Type with events which is emitted by PubNub client and can be handled with callback passed to the
     * {@link EventTarget#addEventListener|addEventListener}.
     */
    var PubNubClientEvent;
    (function (PubNubClientEvent) {
        /**
         * Client unregistered (no connection through SharedWorker connection ports).
         *
         */
        PubNubClientEvent["Unregister"] = "unregister";
        /**
         * Client temporarily disconnected.
         */
        PubNubClientEvent["Disconnect"] = "disconnect";
        /**
         * User ID for current PubNub client has been changed.
         *
         * On identity change for proper further operation expected following actions:
         * - send immediate heartbeat with new `user ID` (if has been sent before)
         * - start subscribe long-poll request with new `user ID` (if has been sent before). If it required, cancel previous
         * long-poll request.
         */
        PubNubClientEvent["IdentityChange"] = "identityChange";
        /**
         * Authentication token change event.
         *
         * On authentication token change for proper further operation expected following actions:
         * - cached `subscribe` request query parameter updated
         * - cached `heartbeat` request query parameter updated
         */
        PubNubClientEvent["AuthChange"] = "authChange";
        /**
         * Presence heartbeat interval change event.
         *
         * On heartbeat interval change for proper further operation expected following actions:
         * - restart _backup_ heartbeat timer with new interval.
         */
        PubNubClientEvent["HeartbeatIntervalChange"] = "heartbeatIntervalChange";
        /**
         * Core PubNub client module request to send `subscribe` request.
         */
        PubNubClientEvent["SendSubscribeRequest"] = "sendSubscribeRequest";
        /**
         * Core PubNub client module request to send `heartbeat` request.
         */
        PubNubClientEvent["SendHeartbeatRequest"] = "sendHeartbeatRequest";
        /**
         * Core PubNub client module request to send `leave` request.
         */
        PubNubClientEvent["SendLeaveRequest"] = "sendLeaveRequest";
    })(PubNubClientEvent || (PubNubClientEvent = {}));
    /**
     * Base request processing event class.
     */
    class BasePubNubClientEvent extends CustomEvent {
        /**
         * Retrieve reference to PubNub client which dispatched event.
         *
         * @returns Reference to PubNub client which dispatched event.
         */
        get client() {
            return this.detail.client;
        }
    }
    /**
     * Dispatched by PubNub client when it has been unregistered.
     */
    class PubNubClientUnregisterEvent extends BasePubNubClientEvent {
        /**
         * Create PubNub client unregister event.
         *
         * @param client - Reference to unregistered PubNub client.
         */
        constructor(client) {
            super(PubNubClientEvent.Unregister, { detail: { client } });
        }
        /**
         * Create clone of unregister event to make it possible to forward event upstream.
         *
         * @returns Client unregister event.
         */
        clone() {
            return new PubNubClientUnregisterEvent(this.client);
        }
    }
    /**
     * Dispatched by PubNub client when it has been disconnected.
     */
    class PubNubClientDisconnectEvent extends BasePubNubClientEvent {
        /**
         * Create PubNub client disconnect event.
         *
         * @param client - Reference to disconnected PubNub client.
         */
        constructor(client) {
            super(PubNubClientEvent.Disconnect, { detail: { client } });
        }
        /**
         * Create clone of disconnect event to make it possible to forward event upstream.
         *
         * @returns Client disconnect event.
         */
        clone() {
            return new PubNubClientDisconnectEvent(this.client);
        }
    }
    /**
     * Dispatched by PubNub client when it changes user identity (`userId` has been changed).
     */
    class PubNubClientIdentityChangeEvent extends BasePubNubClientEvent {
        /**
         * Create PubNub client identity change event.
         *
         * @param client - Reference to the PubNub client which changed identity.
         * @param oldUserId - User ID which has been previously used by the `client`.
         * @param newUserId - User ID which will used by the `client`.
         */
        constructor(client, oldUserId, newUserId) {
            super(PubNubClientEvent.IdentityChange, { detail: { client, oldUserId, newUserId } });
        }
        /**
         * Retrieve `userId` which has been previously used by the `client`.
         *
         * @returns `userId` which has been previously used by the `client`.
         */
        get oldUserId() {
            return this.detail.oldUserId;
        }
        /**
         * Retrieve `userId` which will used by the `client`.
         *
         * @returns `userId` which will used by the `client`.
         */
        get newUserId() {
            return this.detail.newUserId;
        }
        /**
         * Create clone of identity change event to make it possible to forward event upstream.
         *
         * @returns Client identity change event.
         */
        clone() {
            return new PubNubClientIdentityChangeEvent(this.client, this.oldUserId, this.newUserId);
        }
    }
    /**
     * Dispatched by PubNub client when it changes authentication data (`auth` has been changed).
     */
    class PubNubClientAuthChangeEvent extends BasePubNubClientEvent {
        /**
         * Create PubNub client authentication change event.
         *
         * @param client - Reference to the PubNub client which changed authentication.
         * @param newAuth - Authentication which will used by the `client`.
         * @param [oldAuth] - Authentication which has been previously used by the `client`.
         */
        constructor(client, newAuth, oldAuth) {
            super(PubNubClientEvent.AuthChange, { detail: { client, oldAuth, newAuth } });
        }
        /**
         * Retrieve authentication which has been previously used by the `client`.
         *
         * @returns Authentication which has been previously used by the `client`.
         */
        get oldAuth() {
            return this.detail.oldAuth;
        }
        /**
         * Retrieve authentication which will used by the `client`.
         *
         * @returns Authentication which will used by the `client`.
         */
        get newAuth() {
            return this.detail.newAuth;
        }
        /**
         * Create clone of authentication change event to make it possible to forward event upstream.
         *
         * @returns Client authentication change event.
         */
        clone() {
            return new PubNubClientAuthChangeEvent(this.client, this.newAuth, this.oldAuth);
        }
    }
    /**
     * Dispatched by PubNub client when it changes heartbeat interval.
     */
    class PubNubClientHeartbeatIntervalChangeEvent extends BasePubNubClientEvent {
        /**
         * Create PubNub client heartbeat interval change event.
         *
         * @param client - Reference to the PubNub client which changed heartbeat interval.
         * @param [newInterval] - New heartbeat request send interval.
         * @param [oldInterval] - Previous heartbeat request send interval.
         */
        constructor(client, newInterval, oldInterval) {
            super(PubNubClientEvent.HeartbeatIntervalChange, { detail: { client, oldInterval, newInterval } });
        }
        /**
         * Retrieve previous heartbeat request send interval.
         *
         * @returns Previous heartbeat request send interval.
         */
        get oldInterval() {
            return this.detail.oldInterval;
        }
        /**
         * Retrieve new heartbeat request send interval.
         *
         * @returns New heartbeat request send interval.
         */
        get newInterval() {
            return this.detail.newInterval;
        }
        /**
         * Create clone of heartbeat interval change event to make it possible to forward event upstream.
         *
         * @returns Client heartbeat interval change event.
         */
        clone() {
            return new PubNubClientHeartbeatIntervalChangeEvent(this.client, this.newInterval, this.oldInterval);
        }
    }
    /**
     * Dispatched when core PubNub client module requested to send subscribe request.
     */
    class PubNubClientSendSubscribeEvent extends BasePubNubClientEvent {
        /**
         * Create subscribe request send event.
         *
         * @param client - Reference to the PubNub client which requested to send request.
         * @param request - Subscription request object.
         */
        constructor(client, request) {
            super(PubNubClientEvent.SendSubscribeRequest, { detail: { client, request } });
        }
        /**
         * Retrieve subscription request object.
         *
         * @returns Subscription request object.
         */
        get request() {
            return this.detail.request;
        }
        /**
         * Create clone of send subscribe request event to make it possible to forward event upstream.
         *
         * @returns Client send subscribe request event.
         */
        clone() {
            return new PubNubClientSendSubscribeEvent(this.client, this.request);
        }
    }
    /**
     * Dispatched when core PubNub client module requested to send heartbeat request.
     */
    class PubNubClientSendHeartbeatEvent extends BasePubNubClientEvent {
        /**
         * Create heartbeat request send event.
         *
         * @param client - Reference to the PubNub client which requested to send request.
         * @param request - Heartbeat request object.
         */
        constructor(client, request) {
            super(PubNubClientEvent.SendHeartbeatRequest, { detail: { client, request } });
        }
        /**
         * Retrieve heartbeat request object.
         *
         * @returns Heartbeat request object.
         */
        get request() {
            return this.detail.request;
        }
        /**
         * Create clone of send heartbeat request event to make it possible to forward event upstream.
         *
         * @returns Client send heartbeat request event.
         */
        clone() {
            return new PubNubClientSendHeartbeatEvent(this.client, this.request);
        }
    }
    /**
     * Dispatched when core PubNub client module requested to send leave request.
     */
    class PubNubClientSendLeaveEvent extends BasePubNubClientEvent {
        /**
         * Create leave request send event.
         *
         * @param client - Reference to the PubNub client which requested to send request.
         * @param request - Leave request object.
         */
        constructor(client, request) {
            super(PubNubClientEvent.SendLeaveRequest, { detail: { client, request } });
        }
        /**
         * Retrieve leave request object.
         *
         * @returns Leave request object.
         */
        get request() {
            return this.detail.request;
        }
        /**
         * Create clone of send leave request event to make it possible to forward event upstream.
         *
         * @returns Client send leave request event.
         */
        clone() {
            return new PubNubClientSendLeaveEvent(this.client, this.request);
        }
    }

    /**
     * Type with events which is dispatched by PubNub clients manager and can be handled with callback passed to the
     * {@link EventTarget#addEventListener|addEventListener}.
     */
    var PubNubClientsManagerEvent;
    (function (PubNubClientsManagerEvent) {
        /**
         * New PubNub client has been registered.
         */
        PubNubClientsManagerEvent["Registered"] = "Registered";
        /**
         * PubNub client has been unregistered.
         */
        PubNubClientsManagerEvent["Unregistered"] = "Unregistered";
    })(PubNubClientsManagerEvent || (PubNubClientsManagerEvent = {}));
    /**
     * Dispatched by clients manager when new PubNub client registers within `SharedWorker`.
     */
    class PubNubClientManagerRegisterEvent extends CustomEvent {
        /**
         * Create client registration event.
         *
         * @param client - Reference to the registered PubNub client.
         */
        constructor(client) {
            super(PubNubClientsManagerEvent.Registered, { detail: client });
        }
        /**
         * Retrieve reference to registered PubNub client.
         *
         * @returns Reference to registered PubNub client.
         */
        get client() {
            return this.detail;
        }
        /**
         * Create clone of new client register event to make it possible to forward event upstream.
         *
         * @returns Client new client register event.
         */
        clone() {
            return new PubNubClientManagerRegisterEvent(this.client);
        }
    }
    /**
     * Dispatched by clients manager when PubNub client unregisters from `SharedWorker`.
     */
    class PubNubClientManagerUnregisterEvent extends CustomEvent {
        /**
         * Create client unregistration event.
         *
         * @param client - Reference to the unregistered PubNub client.
         * @param withLeave - Whether `leave` request should be sent or not.
         */
        constructor(client, withLeave = false) {
            super(PubNubClientsManagerEvent.Unregistered, { detail: { client, withLeave } });
        }
        /**
         * Retrieve reference to the unregistered PubNub client.
         *
         * @returns Reference to the unregistered PubNub client.
         */
        get client() {
            return this.detail.client;
        }
        /**
         * Retrieve whether `leave` request should be sent or not.
         *
         * @returns `true` if `leave` request should be sent for previously used channels and groups.
         */
        get withLeave() {
            return this.detail.withLeave;
        }
        /**
         * Create clone of client unregister event to make it possible to forward event upstream.
         *
         * @returns Client client unregister event.
         */
        clone() {
            return new PubNubClientManagerUnregisterEvent(this.client, this.withLeave);
        }
    }

    /**
     * Type with events which is dispatched by subscription state in response to client-provided requests and PubNub
     * client state change.
     */
    var SubscriptionStateEvent;
    (function (SubscriptionStateEvent) {
        /**
         * Subscription state has been changed.
         */
        SubscriptionStateEvent["Changed"] = "changed";
    })(SubscriptionStateEvent || (SubscriptionStateEvent = {}));
    /**
     * Dispatched by subscription state when state and service requests are changed.
     */
    class SubscriptionStateChangeEvent extends CustomEvent {
        /**
         * Create subscription state change event.
         *
         * @param newRequests - List of new service requests which need to be scheduled for processing.
         * @param canceledRequests - List of previously scheduled service requests which should be cancelled.
         */
        constructor(newRequests, canceledRequests) {
            super(SubscriptionStateEvent.Changed, { detail: { newRequests, canceledRequests } });
        }
        /**
         * Retrieve list of new service requests which need to be scheduled for processing.
         *
         * @returns List of new service requests which need to be scheduled for processing.
         */
        get newRequests() {
            return this.detail.newRequests;
        }
        /**
         * Retrieve list of previously scheduled service requests which should be cancelled.
         *
         * @returns List of previously scheduled service requests which should be cancelled.
         */
        get canceledRequests() {
            return this.detail.canceledRequests;
        }
        /**
         * Create clone of subscription state change event to make it possible to forward event upstream.
         *
         * @returns Client subscription state change event.
         */
        clone() {
            return new SubscriptionStateChangeEvent(this.newRequests, this.canceledRequests);
        }
    }

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

    /**
     * Type with events which is emitted by request and can be handled with callback passed to the
     * {@link EventTarget#addEventListener|addEventListener}.
     */
    var PubNubSharedWorkerRequestEvents;
    (function (PubNubSharedWorkerRequestEvents) {
        /**
         * Request processing started.
         */
        PubNubSharedWorkerRequestEvents["Started"] = "started";
        /**
         * Request processing has been canceled.
         *
         * **Note:** This event dispatched only by client-provided requests.
         */
        PubNubSharedWorkerRequestEvents["Canceled"] = "canceled";
        /**
         * Request successfully completed.
         */
        PubNubSharedWorkerRequestEvents["Success"] = "success";
        /**
         * Request completed with error.
         *
         * Error can be caused by:
         * - missing permissions (403)
         * - network issues
         */
        PubNubSharedWorkerRequestEvents["Error"] = "error";
    })(PubNubSharedWorkerRequestEvents || (PubNubSharedWorkerRequestEvents = {}));
    /**
     * Base request processing event class.
     */
    class BaseRequestEvent extends CustomEvent {
        /**
         * Retrieve service (aggregated / updated) request.
         *
         * @returns Service (aggregated / updated) request.
         */
        get request() {
            return this.detail.request;
        }
    }
    /**
     * Dispatched by request when linked service request processing started.
     */
    class RequestStartEvent extends BaseRequestEvent {
        /**
         * Create request processing start event.
         *
         * @param request - Service (aggregated / updated) request.
         */
        constructor(request) {
            super(PubNubSharedWorkerRequestEvents.Started, { detail: { request } });
        }
        /**
         * Create clone of request processing start event to make it possible to forward event upstream.
         *
         * @returns Client request processing start event.
         */
        clone() {
            return new RequestStartEvent(this.request);
        }
    }
    /**
     * Dispatched by request when linked service request processing completed.
     */
    class RequestSuccessEvent extends BaseRequestEvent {
        /**
         * Create request processing success event.
         *
         * @param request - Service (aggregated / updated) request.
         * @param fetchRequest - Actual request which has been used with {@link fetch}.
         * @param response - PubNub service response.
         */
        constructor(request, fetchRequest, response) {
            super(PubNubSharedWorkerRequestEvents.Success, { detail: { request, fetchRequest, response } });
        }
        /**
         * Retrieve actual request which has been used with {@link fetch}.
         *
         * @returns Actual request which has been used with {@link fetch}.
         */
        get fetchRequest() {
            return this.detail.fetchRequest;
        }
        /**
         * Retrieve PubNub service response.
         *
         * @returns Service response.
         */
        get response() {
            return this.detail.response;
        }
        /**
         * Create clone of request processing success event to make it possible to forward event upstream.
         *
         * @returns Client request processing success event.
         */
        clone() {
            return new RequestSuccessEvent(this.request, this.fetchRequest, this.response);
        }
    }
    /**
     * Dispatched by request when linked service request processing failed / service error response.
     */
    class RequestErrorEvent extends BaseRequestEvent {
        /**
         * Create request processing error event.
         *
         * @param request - Service (aggregated / updated) request.
         * @param fetchRequest - Actual request which has been used with {@link fetch}.
         * @param error - Request processing error information.
         */
        constructor(request, fetchRequest, error) {
            super(PubNubSharedWorkerRequestEvents.Error, { detail: { request, fetchRequest, error } });
        }
        /**
         * Retrieve actual request which has been used with {@link fetch}.
         *
         * @returns Actual request which has been used with {@link fetch}.
         */
        get fetchRequest() {
            return this.detail.fetchRequest;
        }
        /**
         * Retrieve request processing error description.
         *
         * @returns Request processing error description.
         */
        get error() {
            return this.detail.error;
        }
        /**
         * Create clone of request processing failure event to make it possible to forward event upstream.
         *
         * @returns Client request processing failure event.
         */
        clone() {
            return new RequestErrorEvent(this.request, this.fetchRequest, this.error);
        }
    }
    /**
     * Dispatched by request when it has been canceled.
     */
    class RequestCancelEvent extends BaseRequestEvent {
        /**
         * Create request cancelling event.
         *
         * @param request - Client-provided (original) request.
         */
        constructor(request) {
            super(PubNubSharedWorkerRequestEvents.Canceled, { detail: { request } });
        }
        /**
         * Create clone of request cancel event to make it possible to forward event upstream.
         *
         * @returns Client request cancel event.
         */
        clone() {
            return new RequestCancelEvent(this.request);
        }
    }

    /**
     * Base shared worker request implementation.
     */
    class PubNubSharedWorkerRequest extends EventTarget {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructors ---------------------
        // --------------------------------------------------------
        // region Constructors
        /**
         * Create request object.
         *
         * @param request - Transport request.
         * @param subscribeKey - Subscribe REST API access key.
         * @param channelGroups - List of channel groups used in request.
         * @param channels - List of channels used in request.
         * @param userId - Unique user identifier from the name of which request will be made.
         * @param [accessToken] - Access token with permissions to access
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups} on behalf of `userId`.
         */
        constructor(request, subscribeKey, channelGroups, channels, userId, accessToken) {
            super();
            this.request = request;
            this.subscribeKey = subscribeKey;
            this.channelGroups = channelGroups;
            this.channels = channels;
            /**
             * Whether request already received service response or an error.
             */
            this._completed = false;
            /**
             * Stringify request query key / value pairs.
             *
             * @param query - Request query object.
             *
             * @returns Stringified query object.
             */
            this.queryStringFromObject = (query) => {
                return Object.keys(query)
                    .map((key) => {
                    const queryValue = query[key];
                    if (!Array.isArray(queryValue))
                        return `${key}=${this.encodeString(queryValue)}`;
                    return queryValue.map((value) => `${key}=${this.encodeString(value)}`).join('&');
                })
                    .join('&');
            };
            this._accessToken = accessToken;
            this._userId = userId;
        }
        /**
         * Notify listeners that ongoing request processing has been cancelled.
         */
        cancel() {
            // There is no point in completed request cancellation.
            if (this.completed)
                return;
            // Unlink client-provided request from service request.
            this.serviceRequest = undefined;
            // There is no need to announce about cancellation of request which can't be canceled (only listeners clean up has
            // been done).
            if (this.request.cancellable)
                this.dispatchEvent(new RequestCancelEvent(this));
        }
        // endregion
        // --------------------------------------------------------
        // ---------------------- Properties ----------------------
        // --------------------------------------------------------
        // region Properties
        /**
         * Retrieve origin which is used to access PubNub REST API.
         *
         * @returns Origin which is used to access PubNub REST API.
         */
        get origin() {
            return this.request.origin;
        }
        /**
         * Retrieve unique user identifier from the name of which request will be made.
         *
         * @returns Unique user identifier from the name of which request will be made.
         */
        get userId() {
            return this._userId;
        }
        /**
         * Update unique user identifier from the name of which request will be made.
         *
         * @param value - New unique user identifier.
         */
        set userId(value) {
            this._userId = value;
            // Patch underlying transport request query parameters to use new value.
            this.request.queryParameters.uuid = value;
        }
        /**
         * Retrieve access token with permissions to access
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
         *
         * @returns Access token with permissions for {@link PubNubSharedWorkerRequest#userId|userId}.
         */
        get accessToken() {
            return this._accessToken;
        }
        /**
         * Update access token which should be used to access
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups} on behalf of `userId`.
         *
         * @param value Access token with permissions for {@link PubNubSharedWorkerRequest#userId|userId}.
         */
        set accessToken(value) {
            this._accessToken = value;
            // Patch underlying transport request query parameters to use new value.
            if (value)
                this.request.queryParameters.auth = value.toString();
            else
                delete this.request.queryParameters.auth;
        }
        /**
         * Retrieve PubNub client associates with request.
         *
         * @returns Reference to the PubNub client which is sending request.
         */
        get client() {
            return this._client;
        }
        /**
         * Associate request with PubNub client.
         *
         * @param value - PubNub client which created request in `SharedWorker` context.
         */
        set client(value) {
            this._client = value;
        }
        /**
         * Retrieve whether request already received service response or an error.
         *
         * @returns `true` if request already completed processing (not with {@link PubNubSharedWorkerRequest#cancel|cancel}).
         */
        get completed() {
            return this._completed;
        }
        /**
         * Retrieve whether request can be cancelled or not.
         *
         * @returns `true` if there is possibility and meaning to be able to cancel request.
         */
        get cancellable() {
            return this.request.cancellable;
        }
        /**
         * Represent transport request as {@link fetch} {@link Request}.
         *
         * @returns Ready to use {@link Request} instance.
         */
        get asFetchRequest() {
            let headers = undefined;
            const queryParameters = this.request.queryParameters;
            let path = this.request.path;
            if (this.request.headers) {
                headers = {};
                for (const [key, value] of Object.entries(this.request.headers))
                    headers[key] = value;
            }
            if (queryParameters && Object.keys(queryParameters).length !== 0)
                path = `${path}?${this.queryStringFromObject(queryParameters)}`;
            return new Request(`${this.request.origin}${path}`, {
                method: this.request.method,
                headers,
                redirect: 'follow',
            });
        }
        /**
         * Retrieve service (aggregated/modified) request which will actually be used to call REST API endpoint.
         *
         * @returns Service (aggregated/modified) request which will actually be used to call REST API endpoint.
         */
        get serviceRequest() {
            return this._serviceRequest;
        }
        /**
         * Link request processing results to the service (aggregated/modified) request.
         *
         * @param value - Service (aggregated/modified) request for which process progress should be observed.
         */
        set serviceRequest(value) {
            if (this.listenerAbortController) {
                // Ignore attempt to set same service request.
                if (this._serviceRequest && value && this._serviceRequest.request.identifier === value.request.identifier)
                    return;
                if (this.listenerAbortController) {
                    this.listenerAbortController.abort();
                    this.listenerAbortController = undefined;
                }
            }
            this._serviceRequest = value;
            // There is no point to add listeners for request which already completed.
            if (!value || this.completed)
                return;
            this.listenerAbortController = new AbortController();
            value.addEventListener(PubNubSharedWorkerRequestEvents.Started, (evt) => {
                if (!(evt instanceof RequestStartEvent))
                    return;
                const event = evt;
                // Notify about request processing start.
                this.logRequestStart(event.request);
                // Forward event from the name of this request (because it has been linked to the service request).
                this.dispatchEvent(event.clone());
            }, { signal: this.listenerAbortController.signal, once: true });
            value.addEventListener(PubNubSharedWorkerRequestEvents.Success, (evt) => {
                if (!(evt instanceof RequestSuccessEvent))
                    return;
                const event = evt;
                // Clean up other listeners.
                if (this.listenerAbortController) {
                    this.listenerAbortController.abort();
                    this.listenerAbortController = undefined;
                }
                // Append request-specific information
                this.addRequestInformationForResult(event.request, event.fetchRequest, event.response);
                // Notify about request processing successfully completed.
                this.logRequestSuccess(event.request, event.response);
                // Mark that request received successful response.
                this._completed = true;
                // Forward event from the name of this request (because it has been linked to the service request).
                this.dispatchEvent(event.clone());
            }, { signal: this.listenerAbortController.signal, once: true });
            value.addEventListener(PubNubSharedWorkerRequestEvents.Error, (evt) => {
                if (!(evt instanceof RequestErrorEvent))
                    return;
                const event = evt;
                // Clean up other listeners.
                if (this.listenerAbortController) {
                    this.listenerAbortController.abort();
                    this.listenerAbortController = undefined;
                }
                // Append request-specific information
                this.addRequestInformationForResult(event.request, event.fetchRequest, event.error);
                // Notify about request processing error.
                this.logRequestError(event.request, event.error);
                // Mark that request received error.
                this._completed = true;
                // Forward event from the name of this request (because it has been linked to the service request).
                this.dispatchEvent(event.clone());
            }, { signal: this.listenerAbortController.signal, once: true });
        }
        // endregion
        // --------------------------------------------------------
        // ------------- Request processing handlers --------------
        // --------------------------------------------------------
        // region Request processing handlers
        /**
         * Handle request processing started by request manager (actual sending).
         *
         * **Important:** Function should be called only for `SharedWorker`-provided requests.
         */
        handleProcessingStarted() {
            // Notify about request processing start (will be made only for client-provided request).
            this.logRequestStart(this);
            this.dispatchEvent(new RequestStartEvent(this));
        }
        /**
         * Handle request processing successfully completed by request manager (actual sending).
         *
         * **Important:** Function should be called only for `SharedWorker`-provided requests.
         *
         * @param fetchRequest - Reference to actual request which has been used with {@link fetch}.
         * @param response - PubNub service response.
         */
        handleProcessingSuccess(fetchRequest, response) {
            // Append request-specific information
            this.addRequestInformationForResult(this, fetchRequest, response);
            // Notify about request processing successfully completed (will be made only for client-provided request).
            this.logRequestSuccess(this, response);
            // Mark that request received successful response.
            this._completed = true;
            this.dispatchEvent(new RequestSuccessEvent(this, fetchRequest, response));
        }
        /**
         * Handle request processing failed by request manager (actual sending).
         *
         * **Important:** Function should be called only for `SharedWorker`-provided requests.
         *
         * @param fetchRequest - Reference to actual request which has been used with {@link fetch}.
         * @param error - Request processing error description.
         */
        handleProcessingError(fetchRequest, error) {
            // Append request-specific information
            this.addRequestInformationForResult(this, fetchRequest, error);
            // Notify about request processing error (will be made only for client-provided request).
            this.logRequestError(this, error);
            // Mark that request received error.
            this._completed = true;
            this.dispatchEvent(new RequestErrorEvent(this, fetchRequest, error));
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Append request-specific information to the processing result.
         *
         * @param fetchRequest - Reference to actual request which has been used with {@link fetch}.
         * @param request - Reference to the client- or service-provided request with information for response.
         * @param result - Request processing result which should be modified.
         */
        addRequestInformationForResult(request, fetchRequest, result) {
            if (!this._client)
                return;
            result.clientIdentifier = this._client.identifier;
            result.identifier = this.request.identifier;
            result.url = fetchRequest.url;
        }
        /**
         * Log to the core PubNub client module information about request processing start.
         *
         * @param request - Reference to the client- or service-provided request information about which should be logged.
         */
        logRequestStart(request) {
            if (!this._client)
                return;
            this._client.logger.debug(() => ({ messageType: 'network-request', message: request.request }));
        }
        /**
         * Log to the core PubNub client module information about request processing successful completion.
         *
         * @param request - Reference to the client- or service-provided request information about which should be logged.
         * @param response - Reference to the PubNub service response.
         */
        logRequestSuccess(request, response) {
            if (!this._client)
                return;
            this._client.logger.debug(() => {
                const { status, headers, body } = response.response;
                const fetchRequest = request.asFetchRequest;
                const _headers = {};
                // Copy Headers object content into plain Record.
                Object.entries(headers).forEach(([key, value]) => (_headers[key.toLowerCase()] = value.toLowerCase()));
                return { messageType: 'network-response', message: { status, url: fetchRequest.url, headers, body } };
            });
        }
        /**
         * Log to the core PubNub client module information about request processing error.
         *
         * @param request - Reference to the client- or service-provided request information about which should be logged.
         * @param error - Request processing error information.
         */
        logRequestError(request, error) {
            if (!this._client)
                return;
            if ((error.error ? error.error.message : 'Unknown').toLowerCase().includes('timeout')) {
                this._client.logger.debug(() => ({
                    messageType: 'network-request',
                    message: request.request,
                    details: 'Timeout',
                    canceled: true,
                }));
            }
            else {
                this._client.logger.warn(() => {
                    const { details, canceled } = this.errorDetailsFromSendingError(error);
                    let logDetails = details;
                    if (canceled)
                        logDetails = 'Aborted';
                    else if (details.toLowerCase().includes('network'))
                        logDetails = 'Network error';
                    return {
                        messageType: 'network-request',
                        message: request.request,
                        details: logDetails,
                        canceled: canceled,
                        failed: !canceled,
                    };
                });
            }
        }
        /**
         * Retrieve error details from error response object.
         *
         * @param error - Request fetch error object.
         * @reruns Object with error details and whether it has been canceled or not.
         */
        errorDetailsFromSendingError(error) {
            const canceled = error.error ? error.error.type === 'TIMEOUT' || error.error.type === 'ABORTED' : false;
            let details = error.error ? error.error.message : 'Unknown';
            if (error.response) {
                const contentType = error.response.headers['content-type'];
                if (error.response.body &&
                    contentType &&
                    (contentType.indexOf('javascript') !== -1 || contentType.indexOf('json') !== -1)) {
                    try {
                        const serviceResponse = JSON.parse(new TextDecoder().decode(error.response.body));
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
                    if (error.response.status >= 500)
                        details = 'Internal Server Error';
                    else if (error.response.status == 400)
                        details = 'Bad request';
                    else if (error.response.status == 403)
                        details = 'Access denied';
                    else
                        details = `${error.response.status}`;
                }
            }
            return { details, canceled };
        }
        /**
         * Percent-encode input string.
         *
         * **Note:** Encode content in accordance of the `PubNub` service requirements.
         *
         * @param input - Source string or number for encoding.
         *
         * @returns Percent-encoded string.
         */
        encodeString(input) {
            return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
        }
    }

    class SubscribeRequest extends PubNubSharedWorkerRequest {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructors ---------------------
        // --------------------------------------------------------
        // region Constructors
        /**
         * Create subscribe request from received _transparent_ transport request.
         *
         * @param request - Object with subscribe transport request.
         * @param subscriptionKey - Subscribe REST API access key.
         * @param [accessToken] - Access token with read permissions on
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
         * @returns Initialized and ready to use subscribe request.
         */
        static fromTransportRequest(request, subscriptionKey, accessToken) {
            return new SubscribeRequest(request, subscriptionKey, accessToken);
        }
        /**
         * Create subscribe request from previously cached data.
         *
         * @param request - Object with subscribe transport request.
         * @param subscriptionKey - Subscribe REST API access key.
         * @param [cachedChannelGroups] - Previously cached list of channel groups for subscription.
         * @param [cachedChannels] - Previously cached list of channels for subscription.
         * @param [cachedState] - Previously cached user's presence state for channels and groups.
         * @param [accessToken] - Access token with read permissions on
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
         * @retusns Initialized and ready to use subscribe request.
         */
        static fromCachedState(request, subscriptionKey, cachedChannelGroups, cachedChannels, cachedState, accessToken) {
            return new SubscribeRequest(request, subscriptionKey, accessToken, cachedChannels, cachedChannelGroups, cachedState);
        }
        /**
         * Create aggregated subscribe request.
         *
         * @param requests - List of subscribe requests for same the user.
         * @param [accessToken] - Access token with permissions to announce presence on
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
         * @param timetokenOverride - Timetoken which should be used to patch timetoken in initial response.
         * @param timetokenRegionOverride - Timetoken origin which should be used to patch timetoken origin in initial
         * response.
         * @returns Aggregated subscribe request which will be sent.
         */
        static fromRequests(requests, accessToken, timetokenOverride, timetokenRegionOverride) {
            const baseRequest = requests[Math.floor(Math.random() * requests.length)];
            const aggregatedRequest = Object.assign({}, baseRequest.request);
            let state = {};
            const channelGroups = new Set();
            const channels = new Set();
            for (const request of requests) {
                if (request.state)
                    state = Object.assign(Object.assign({}, state), request.state);
                request.channelGroups.forEach(channelGroups.add, channelGroups);
                request.channels.forEach(channels.add, channels);
            }
            // Update request channels list (if required).
            if (channels.size || channelGroups.size) {
                const pathComponents = aggregatedRequest.path.split('/');
                pathComponents[4] = channels.size ? [...channels].sort().join(',') : ',';
                aggregatedRequest.path = pathComponents.join('/');
            }
            // Update request channel groups list (if required).
            if (channelGroups.size)
                aggregatedRequest.queryParameters['channel-group'] = [...channelGroups].sort().join(',');
            // Update request `state` (if required).
            if (Object.keys(state).length)
                aggregatedRequest.queryParameters.state = JSON.stringify(state);
            else
                delete aggregatedRequest.queryParameters.state;
            if (accessToken)
                aggregatedRequest.queryParameters.auth = accessToken.toString();
            aggregatedRequest.identifier = uuidGenerator.createUUID();
            // Create service request and link to its result other requests used in aggregation.
            const request = new SubscribeRequest(aggregatedRequest, baseRequest.subscribeKey, accessToken);
            for (const clientRequest of requests)
                clientRequest.serviceRequest = request;
            if (request.isInitialSubscribe && timetokenOverride && timetokenOverride !== '0') {
                request.timetokenOverride = timetokenOverride;
                if (timetokenRegionOverride)
                    request.timetokenRegionOverride = timetokenRegionOverride;
            }
            return request;
        }
        /**
         * Create subscribe request from received _transparent_ transport request.
         *
         * @param request - Object with subscribe transport request.
         * @param subscriptionKey - Subscribe REST API access key.
         * @param [accessToken] - Access token with read permissions on
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
         * @param [cachedChannels] - Previously cached list of channels for subscription.
         * @param [cachedChannelGroups] - Previously cached list of channel groups for subscription.
         * @param [cachedState] - Previously cached user's presence state for channels and groups.
         */
        constructor(request, subscriptionKey, accessToken, cachedChannelGroups, cachedChannels, cachedState) {
            var _a;
            // Retrieve information about request's origin (who initiated it).
            const requireCachedStateReset = !!request.queryParameters && 'on-demand' in request.queryParameters;
            if (requireCachedStateReset)
                delete request.queryParameters['on-demand'];
            super(request, subscriptionKey, cachedChannelGroups !== null && cachedChannelGroups !== void 0 ? cachedChannelGroups : SubscribeRequest.channelGroupsFromRequest(request), cachedChannels !== null && cachedChannels !== void 0 ? cachedChannels : SubscribeRequest.channelsFromRequest(request), request.queryParameters.uuid, accessToken);
            /**
             * Request creation timestamp.
             */
            this.creationDate = Date.now();
            /**
             * Timetoken region which should be used to patch timetoken origin in initial response.
             */
            this.timetokenRegionOverride = '0';
            this.requireCachedStateReset = requireCachedStateReset;
            if (request.queryParameters['filter-expr'])
                this.filterExpression = request.queryParameters['filter-expr'];
            this.timetoken = ((_a = request.queryParameters.tt) !== null && _a !== void 0 ? _a : '0');
            if (request.queryParameters.tr)
                this.region = request.queryParameters.tr;
            if (cachedState)
                this.state = cachedState;
            // Clean up `state` from objects which is not used with request (if needed).
            if (this.state || !request.queryParameters.state || request.queryParameters.state.length === 0)
                return;
            const state = JSON.parse(request.queryParameters.state);
            for (const objectName of Object.keys(state))
                if (!this.channels.includes(objectName) && !this.channelGroups.includes(objectName))
                    delete state[objectName];
            this.state = state;
        }
        // endregion
        // --------------------------------------------------------
        // ---------------------- Properties ----------------------
        // --------------------------------------------------------
        // region Properties
        /**
         * Represent subscribe request as identifier.
         *
         * Generated identifier will be identical for requests created for the same user.
         */
        get asIdentifier() {
            const auth = this.accessToken ? this.accessToken.asIdentifier : undefined;
            const id = `${this.userId}-${this.subscribeKey}${auth ? `-${auth}` : ''}`;
            return this.filterExpression ? `${id}-${this.filterExpression}` : id;
        }
        /**
         * Retrieve whether this is initial subscribe request or not.
         *
         * @returns `true` if subscribe REST API called with missing or `tt=0` query parameter.
         */
        get isInitialSubscribe() {
            return this.timetoken === '0';
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Check whether client's subscription state cache can be used for new request or not.
         *
         * @param request - Transport request from the core PubNub client module with request origin information.
         * @returns `true` if request created not by user (subscription loop).
         */
        static useCachedState(request) {
            return !!request.queryParameters && 'on-demand' in request.queryParameters;
        }
        /**
         * Check whether received is subset of another `subscribe` request.
         *
         * @param request - Request which should be checked to be superset for received.
         * @retuns `true` in case if receiver is subset of another `subscribe` request.
         */
        isSubsetOf(request) {
            if (request.channelGroups.length && !this.includesStrings(this.channelGroups, request.channelGroups))
                return false;
            if (request.channels.length && !this.includesStrings(this.channels, request.channels))
                return false;
            return this.filterExpression === request.filterExpression;
        }
        /**
         * Extract list of channels for subscription from request URI path.
         *
         * @param request - Transport request from which should be extracted list of channels for presence announcement.
         *
         * @returns List of channel names (not percent-decoded) for which `subscribe` has been called.
         */
        static channelsFromRequest(request) {
            const channels = request.path.split('/')[4];
            return channels === ',' ? [] : channels.split(',').filter((name) => name.length > 0);
        }
        /**
         * Extract list of channel groups for subscription from request query.
         *
         * @param request - Transport request from which should be extracted list of channel groups for presence announcement.
         *
         * @returns List of channel group names (not percent-decoded) for which `subscribe` has been called.
         */
        static channelGroupsFromRequest(request) {
            if (!request.queryParameters || !request.queryParameters['channel-group'])
                return [];
            const group = request.queryParameters['channel-group'];
            return group.length === 0 ? [] : group.split(',').filter((name) => name.length > 0);
        }
        /**
         * Check whether {@link main} array contains all entries from {@link sub} array.
         *
         * @param main - Main array with which `intersection` with {@link sub} should be checked.
         * @param sub - Sub-array whose values should be checked in {@link main}.
         *
         * @returns `true` if all entries from {@link sub} is present in {@link main}.
         */
        includesStrings(main, sub) {
            const set = new Set(main);
            return sub.every(set.has, set);
        }
    }

    /**
     * PubNub access token.
     *
     * Object used to simplify manipulations with requests (aggregation) in the Shared Worker context.
     */
    class AccessToken {
        /**
         * Token comparison based on expiration date.
         *
         * The access token with the most distant expiration date (which should be used in requests) will be at the end of the
         * sorted array.
         *
         * **Note:** `compare` used with {@link Array.sort|sort} function to identify token with more distant expiration date.
         *
         * @param lhToken - Left-hand access token which will be used in {@link Array.sort|sort} comparison.
         * @param rhToken - Right-hand access token which will be used in {@link Array.sort|sort} comparison.
         * @returns Comparison result.
         */
        static compare(lhToken, rhToken) {
            var _a, _b;
            const lhTokenExpiration = (_a = lhToken.expiration) !== null && _a !== void 0 ? _a : 0;
            const rhTokenExpiration = (_b = rhToken.expiration) !== null && _b !== void 0 ? _b : 0;
            return lhTokenExpiration - rhTokenExpiration;
        }
        /**
         * Create access token object for PubNub client.
         *
         * @param token - Authorization key or access token for `read` access to the channels and groups.
         * @param [simplifiedToken] - Simplified access token based only on content of `resources`, `patterns`, and
         * `authorized_uuid`.
         * @param [expiration] - Access token expiration date.
         */
        constructor(token, simplifiedToken, expiration) {
            this.token = token;
            this.simplifiedToken = simplifiedToken;
            this.expiration = expiration;
        }
        /**
         * Represent the access token as identifier.
         *
         * @returns String that lets us identify other access tokens that have similar configurations.
         */
        get asIdentifier() {
            var _a;
            return (_a = this.simplifiedToken) !== null && _a !== void 0 ? _a : this.token;
        }
        /**
         * Check whether two access token objects represent the same permissions or not.
         *
         * @param other - Other access token which should be used in comparison.
         * @returns `true` if received and another access token object represents the same permissions.
         */
        equalTo(other) {
            return this.asIdentifier === other.asIdentifier;
        }
        /**
         * Stringify object to actual access token / key value.
         *
         * @returns Actual access token / key value.
         */
        toString() {
            return this.token;
        }
    }

    class SubscriptionState extends EventTarget {
        constructor() {
            // --------------------------------------------------------
            // ---------------------- Information ---------------------
            // --------------------------------------------------------
            // region Information
            super(...arguments);
            /**
             * Map of client-provided request identifiers to the subscription state listener abort controller.
             */
            this.requestListenersAbort = {};
            /**
             * Map of client identifiers to their portion of data which affects subscription state.
             *
             * **Note:** This information removed only with {@link SubscriptionState.removeClient|removeClient} function call.
             */
            this.clientsState = {};
            /**
             * Map of client to its requests which is pending for service request processing results.
             */
            this.requests = {};
            /**
             * Aggregated/modified subscribe request which is used to call PubNub REST API.
             */
            this.serviceRequests = [];
            /**
             * Cached list of channel groups used with recent aggregation service requests.
             */
            this.channelGroups = new Set();
            /**
             * Cached presence state associated with user for channels and groups used with recent aggregated service request.
             */
            this.state = {};
            /**
             * Cached list of channels used with recent aggregation service requests.
             */
            this.channels = new Set();
            // endregion
        }
        // endregion
        // --------------------------------------------------------
        // ---------------------- Accessors -----------------------
        // --------------------------------------------------------
        // region Accessors
        /**
         * Retrieve portion of subscription state which is related to the specific client.
         *
         * @param client - Reference to the PubNub client for which state should be retrieved.
         * @returns PubNub client's state in subscription.
         */
        stateForClient(client) {
            const clientState = this.clientsState[client.identifier];
            return clientState
                ? { channels: [...clientState.channels], channelGroups: [...clientState.channelGroups], state: clientState.state }
                : { channels: [], channelGroups: [] };
        }
        /**
         * Retrieve portion of subscription state which is unique for the client.
         *
         * Function will return list of channels and groups which has been introduced by the client into the state (no other
         * clients have them).
         *
         * @param client - Reference to the PubNub client for which unique elements should be retrieved from the state.
         * @param channels - List of client's channels from subscription state.
         * @param channelGroups - List of client's channel groups from subscription state.
         * @returns State with channels and channel groups unique for the client.
         */
        uniqueStateForClient(client, channels, channelGroups) {
            let uniqueChannelGroups = [...channelGroups];
            let uniqueChannels = [...channels];
            Object.entries(this.clientsState).forEach(([identifier, state]) => {
                if (identifier === client.identifier)
                    return;
                uniqueChannelGroups = uniqueChannelGroups.filter((channelGroup) => !state.channelGroups.has(channelGroup));
                uniqueChannels = uniqueChannels.filter((channel) => !state.channels.has(channel));
            });
            return { channels: uniqueChannels, channelGroups: uniqueChannelGroups };
        }
        /**
         * Retrieve list of ongoing subscribe requests for the client.
         *
         * @param client - Reference to the client for which requests should be retrieved.
         * @returns List of client's ongoing requests.
         */
        requestsForClient(client) {
            var _a;
            return [...((_a = this.requests[client.identifier]) !== null && _a !== void 0 ? _a : [])];
        }
        // endregion
        // --------------------------------------------------------
        // --------------------- Aggregation ----------------------
        // --------------------------------------------------------
        // region Aggregation
        /**
         * Mark subscription state update start.
         */
        beginChanges() {
            if (this.changesBatch) {
                console.error(`Looks like there is incomplete change transaction. 'commitChanges()' should be called before 'beginChanges()'`);
                return;
            }
            this.changesBatch = {};
        }
        /**
         * Add new client's request to the batched state update.
         *
         * @param client - Reference to PubNub client which is adding new requests for processing.
         * @param requests - List of new client-provided subscribe requests for processing.
         */
        addClientRequests(client, requests) {
            if (!this.changesBatch) {
                console.error(`'beginChanges()' should be called before 'addClientRequests(...)'`);
                return;
            }
            if (!this.changesBatch[client.identifier])
                this.changesBatch[client.identifier] = { add: requests };
            else if (!this.changesBatch[client.identifier].add)
                this.changesBatch[client.identifier].add = requests;
            else
                this.changesBatch[client.identifier].add.push(...requests);
        }
        /**
         * Add removed client's requests to the batched state update.
         *
         * @param client - Reference to PubNub client which is removing existing requests for processing.
         * @param requests - List of previous client-provided subscribe requests for removal.
         */
        removeClientRequests(client, requests) {
            if (!this.changesBatch) {
                console.error(`'beginChanges()' should be called before 'removeClientRequests(...)'`);
                return;
            }
            if (!this.changesBatch[client.identifier])
                this.changesBatch[client.identifier] = { remove: requests };
            else if (!this.changesBatch[client.identifier].remove)
                this.changesBatch[client.identifier].remove = requests;
            else
                this.changesBatch[client.identifier].remove.push(...requests);
        }
        /**
         * Add all requests associated with removed client to the batched state update.
         * @param client
         */
        removeClient(client) {
            if (!this.changesBatch) {
                console.error(`'beginChanges()' should be called before 'removeClient(...)'`);
                return;
            }
            delete this.clientsState[client.identifier];
            if (!this.requests[client.identifier] || this.requests[client.identifier].length === 0)
                return;
            const requests = this.requests[client.identifier];
            if (!this.changesBatch[client.identifier])
                this.changesBatch[client.identifier] = { remove: requests };
            else if (!this.changesBatch[client.identifier].remove)
                this.changesBatch[client.identifier].remove = requests;
            else
                this.changesBatch[client.identifier].remove.push(...requests);
        }
        /**
         * Process batched state update.
         */
        commitChanges() {
            if (!this.changesBatch) {
                console.error(`'beginChanges()' should be called before 'commitChanges()'`);
                return undefined;
            }
            else if (Object.keys(this.changesBatch).length === 0)
                return undefined;
            let stateRefreshRequired = this.channelGroups.size === 0 && this.channels.size === 0;
            let changes;
            // Identify whether state refresh maybe required because of some new PubNub client requests require it or has been
            // removed before completion or not.
            if (!stateRefreshRequired) {
                stateRefreshRequired = Object.values(this.changesBatch).some((state) => (state.remove && state.remove.length) ||
                    (state.add && state.add.some((request) => request.requireCachedStateReset)));
            }
            // Update list of PubNub client requests.
            const appliedRequests = this.applyBatchedRequestChanges();
            if (stateRefreshRequired) {
                const channelGroups = new Set();
                const channels = new Set();
                this.state = {};
                // Aggregate channels and groups from active requests.
                Object.entries(this.requests).forEach(([clientIdentifier, requests]) => {
                    var _a;
                    var _b;
                    const clientState = ((_a = (_b = this.clientsState)[clientIdentifier]) !== null && _a !== void 0 ? _a : (_b[clientIdentifier] = { channels: new Set(), channelGroups: new Set() }));
                    requests.forEach((request) => {
                        if (request.state) {
                            if (!clientState.state)
                                clientState.state = {};
                            clientState.state = Object.assign(Object.assign({}, clientState.state), request.state);
                            this.state = Object.assign(Object.assign({}, this.state), request.state);
                        }
                        request.channelGroups.forEach(clientState.channelGroups.add, clientState.channelGroups);
                        request.channels.forEach(clientState.channels.add, clientState.channels);
                        request.channelGroups.forEach(channelGroups.add, channelGroups);
                        request.channels.forEach(channels.add, channels);
                    });
                });
                changes = this.subscriptionStateChanges(channels, channelGroups);
                // Update state information.
                this.channelGroups = channelGroups;
                this.channels = channels;
                // Identify most suitable access token.
                const sortedTokens = Object.values(this.requests)
                    .flat()
                    .filter((request) => !!request.accessToken)
                    .map((request) => request.accessToken)
                    .sort(AccessToken.compare);
                if (sortedTokens && sortedTokens.length > 0)
                    this.accessToken = sortedTokens.pop();
            }
            // Reset changes batch.
            this.changesBatch = undefined;
            // Identify and dispatch subscription state change event with service requests for cancellation and start.
            this.handleSubscriptionStateChange(changes, appliedRequests.initial, appliedRequests.continuation, appliedRequests.removed);
            return changes;
        }
        /**
         * Process changes in subscription state.
         *
         * @param [changes] - Changes to the subscribed channels and groups in aggregated requests.
         * @param initialRequests - List of client-provided handshake subscribe requests.
         * @param continuationRequests - List of client-provided subscription loop continuation subscribe requests.
         * @param removedRequests - List of client-provided subscribe requests which should be removed from the state.
         */
        handleSubscriptionStateChange(changes, initialRequests, continuationRequests, removedRequests) {
            var _a, _b;
            // If `changes` is undefine it mean that there were no changes in subscription channels/groups list and no need to
            // cancel ongoing long-poll request.
            const serviceRequests = this.serviceRequests.filter((request) => !request.completed);
            const cancelledServiceRequests = [];
            const newServiceRequests = [];
            // Identify token override for initial requests.
            let timetokenOverrideRefreshTimestamp;
            let timetokenOverride;
            let timetokenRegionOverride;
            (initialRequests.length ? continuationRequests : []).forEach((request) => {
                let shouldSetPreviousTimetoken = !timetokenOverride;
                if (!shouldSetPreviousTimetoken && request.timetoken !== '0') {
                    if (timetokenOverride === '0')
                        shouldSetPreviousTimetoken = true;
                    else if (request.timetoken < timetokenOverride)
                        shouldSetPreviousTimetoken = request.creationDate > timetokenOverrideRefreshTimestamp;
                }
                if (shouldSetPreviousTimetoken) {
                    timetokenOverrideRefreshTimestamp = request.creationDate;
                    timetokenOverride = request.timetoken;
                    timetokenRegionOverride = request.region;
                }
            });
            // New aggregated requests constructor.
            const createAggregatedRequest = (requests) => {
                if (requests.length === 0)
                    return;
                const serviceRequest = SubscribeRequest.fromRequests(requests, this.accessToken, timetokenOverride, timetokenRegionOverride);
                this.addListenersForRequestEvents(serviceRequest);
                requests.forEach((request) => (request.serviceRequest = serviceRequest));
                this.serviceRequests.push(serviceRequest);
                newServiceRequests.push(serviceRequest);
            };
            // Check whether already active service requests cover list of channels/groups and there is no need for separate
            // request.
            if (initialRequests.length) {
                const aggregationRequests = [];
                serviceRequests.forEach((serviceRequest) => {
                    for (const request of initialRequests) {
                        if (request.isSubsetOf(serviceRequest)) {
                            if (serviceRequest.isInitialSubscribe)
                                request.serviceRequest = serviceRequest;
                            else {
                                request.handleProcessingStarted();
                                this.makeResponseOnHandshakeRequest(request, serviceRequest.timetoken, serviceRequest.region);
                            }
                        }
                        else
                            aggregationRequests.push(request);
                    }
                });
                if (!serviceRequests.length && !aggregationRequests.length)
                    aggregationRequests.push(...initialRequests);
                // Create handshake service request (if possible)
                createAggregatedRequest(aggregationRequests);
            }
            // Separate continuation requests by next subscription loop timetoken.
            // This prevents possibility that some subscribe requests will be aggregated into one with much newer timetoken and
            // miss messages as result.
            const continuationByTimetoken = {};
            continuationRequests.forEach((request) => {
                if (!continuationByTimetoken[request.timetoken])
                    continuationByTimetoken[request.timetoken] = [request];
                else
                    continuationByTimetoken[request.timetoken].push(request);
            });
            // Create continuation service request (if possible)
            Object.values(continuationByTimetoken).forEach((requests) => createAggregatedRequest(requests));
            // Find active service requests for which removed client-provided requests was the last one who provided channels
            // and groups for them
            if (removedRequests.length && changes && (changes.channelGroups.removed || changes.channels.removed)) {
                const removedChannelGroups = (_a = changes.channelGroups.removed) !== null && _a !== void 0 ? _a : [];
                const removedChannels = (_b = changes.channels.removed) !== null && _b !== void 0 ? _b : [];
                removedRequests.forEach((request) => {
                    const { channels, channelGroups } = request.serviceRequest;
                    if (channelGroups.some((group) => removedChannelGroups.includes(group)) ||
                        channels.some((channel) => removedChannels.includes(channel)))
                        cancelledServiceRequests.push(request.serviceRequest);
                });
            }
            if (newServiceRequests.length || cancelledServiceRequests.length)
                this.dispatchEvent(new SubscriptionStateChangeEvent(newServiceRequests, cancelledServiceRequests));
        }
        // endregion
        // --------------------------------------------------------
        // ------------------- Event Handlers ---------------------
        // --------------------------------------------------------
        // region Event handlers
        addListenersForRequestEvents(request) {
            const abortController = (this.requestListenersAbort[request.request.identifier] = new AbortController());
            const cleanUpCallback = (evt) => {
                this.removeListenersFromRequestEvents(request);
                if (!request.serviceRequest)
                    return;
                // Canceled request should be pulled out from subscription state.
                if (evt instanceof RequestCancelEvent) {
                    const { request } = evt;
                    this.beginChanges();
                    this.removeClientRequests(request.client, [request]);
                    this.commitChanges();
                }
            };
            request.addEventListener(PubNubSharedWorkerRequestEvents.Success, cleanUpCallback, {
                signal: abortController.signal,
                once: true,
            });
            request.addEventListener(PubNubSharedWorkerRequestEvents.Error, cleanUpCallback, {
                signal: abortController.signal,
                once: true,
            });
            request.addEventListener(PubNubSharedWorkerRequestEvents.Canceled, cleanUpCallback, {
                signal: abortController.signal,
                once: true,
            });
        }
        removeListenersFromRequestEvents(request) {
            if (!this.requestListenersAbort[request.request.identifier])
                return;
            this.requestListenersAbort[request.request.identifier].abort();
            delete this.requestListenersAbort[request.request.identifier];
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Return "response" from PubNub service with initial timetoken data.
         *
         * @param request - Client-provided handshake/initial request for which response should be provided.
         * @param timetoken - Timetoken from currently active service request.
         * @param region - Region from currently active service request.
         */
        makeResponseOnHandshakeRequest(request, timetoken, region) {
            const body = new TextEncoder().encode(`{"t":{"t":"${timetoken}","r":${region !== null && region !== void 0 ? region : '0'}},"m":[]}`);
            request.handleProcessingSuccess(request.asFetchRequest, {
                type: 'request-process-success',
                clientIdentifier: '',
                identifier: '',
                url: '',
                response: {
                    contentType: 'text/javascript; charset="UTF-8"',
                    contentLength: body.length,
                    headers: { 'content-type': 'text/javascript; charset="UTF-8"', 'content-length': `${body.length}` },
                    status: 200,
                    body,
                },
            });
        }
        /**
         * Apply batched requests change.
         *
         * @returns Subscribe request separated by different subscription loop stages.
         */
        applyBatchedRequestChanges() {
            const continuationRequests = [];
            const initialRequests = [];
            const removedRequests = [];
            const changesBatch = this.changesBatch;
            // Handle rapid subscribe requests addition and removal (when same subscribe request instance added in both `add`
            // and `remove` operations). Remove has higher priority.
            Object.keys(changesBatch).forEach((clientIdentifier) => {
                if (!changesBatch[clientIdentifier].add || !changesBatch[clientIdentifier].remove)
                    return;
                for (const request of changesBatch[clientIdentifier].remove) {
                    const addRequestIdx = changesBatch[clientIdentifier].add.indexOf(request);
                    if (addRequestIdx >= 0)
                        changesBatch[clientIdentifier].add.splice(addRequestIdx, 1);
                }
            });
            Object.keys(changesBatch).forEach((clientIdentifier) => {
                if (changesBatch[clientIdentifier].add) {
                    if (!this.requests[clientIdentifier])
                        this.requests[clientIdentifier] = [];
                    for (const request of changesBatch[clientIdentifier].add) {
                        if (request.isInitialSubscribe)
                            initialRequests.push(request);
                        else
                            continuationRequests.push(request);
                        this.requests[clientIdentifier].push(request);
                        this.addListenersForRequestEvents(request);
                    }
                }
                if (this.requests[clientIdentifier] && changesBatch[clientIdentifier].remove) {
                    for (const request of changesBatch[clientIdentifier].remove) {
                        const addRequestIdx = this.requests[clientIdentifier].indexOf(request);
                        if (addRequestIdx < 0)
                            continue;
                        if (!request.completed && request.serviceRequest)
                            removedRequests.push(request);
                        this.requests[clientIdentifier].splice(addRequestIdx, 1);
                        this.removeListenersFromRequestEvents(request);
                        if (this.requests[clientIdentifier].length === 0)
                            delete this.requests[clientIdentifier];
                    }
                }
            });
            return { initial: initialRequests, continuation: continuationRequests, removed: removedRequests };
        }
        /**
         * Identify changes to the channels and groups.
         *
         * @param channels - Set with channels which has been left after client requests list has been changed.
         * @param channelGroups - Set with channel groups which has been left after client requests list has been changed.
         * @returns Objects with names of channels and groups which has been added and removed from the current subscription
         * state.
         */
        subscriptionStateChanges(channels, channelGroups) {
            const stateIsEmpty = this.channelGroups.size === 0 && this.channels.size === 0;
            const changes = { channelGroups: {}, channels: {} };
            const removedChannelGroups = [];
            const addedChannelGroups = [];
            const removedChannels = [];
            const addedChannels = [];
            for (const group of channelGroups)
                if (!this.channelGroups.has(group))
                    addedChannelGroups.push(group);
            for (const channel of channels)
                if (!this.channels.has(channel))
                    addedChannels.push(channel);
            if (!stateIsEmpty) {
                for (const group of this.channelGroups)
                    if (!channelGroups.has(group))
                        removedChannelGroups.push(group);
                for (const channel of this.channels)
                    if (!channels.has(channel))
                        removedChannels.push(channel);
            }
            if (addedChannels.length || removedChannels.length) {
                changes.channels = Object.assign(Object.assign({}, (addedChannels.length ? { added: addedChannels } : {})), (removedChannels.length ? { removed: removedChannels } : {}));
            }
            if (addedChannelGroups.length || removedChannelGroups.length) {
                changes.channelGroups = Object.assign(Object.assign({}, (addedChannelGroups.length ? { added: addedChannelGroups } : {})), (removedChannelGroups.length ? { removed: removedChannelGroups } : {}));
            }
            return Object.keys(changes.channelGroups).length === 0 && Object.keys(changes.channels).length === 0
                ? undefined
                : changes;
        }
    }

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
     * SharedWorker's requests manager.
     *
     * Manager responsible for storing client-provided request for the time while enqueue / dequeue service request which
     * is actually sent to the PubNub service.
     */
    class RequestsManager extends EventTarget {
        constructor() {
            // --------------------------------------------------------
            // ---------------------- Information ---------------------
            // --------------------------------------------------------
            // region Information
            super(...arguments);
            /**
             * Map of service-request identifiers to their cancellation controllers.
             */
            this.abortControllers = {};
            // endregion
        }
        // endregion
        // --------------------------------------------------------
        // ------------------ Request processing ------------------
        // --------------------------------------------------------
        // region Request processing
        /**
         * Begin service request processing.
         *
         * @param request - Reference to the service request which should be sent.
         * @param success - Request success completion handler.
         * @param failure - Request failure handler.
         * @param responsePreprocess - Raw response pre-processing function which is used before calling handling callbacks.
         */
        sendRequest(request, success, failure, responsePreprocess) {
            request.handleProcessingStarted();
            if (request.cancellable)
                this.abortControllers[request.request.identifier] = new AbortController();
            const fetchRequest = request.asFetchRequest;
            (() => __awaiter(this, void 0, void 0, function* () {
                var _a;
                Promise.race([
                    fetch(fetchRequest, { signal: (_a = this.abortControllers[request.request.identifier]) === null || _a === void 0 ? void 0 : _a.signal, keepalive: true }),
                    this.requestTimeoutTimer(request.request),
                ])
                    .then((response) => response.arrayBuffer().then((buffer) => [response, buffer]))
                    .then((response) => (responsePreprocess ? responsePreprocess(response) : response))
                    .then((response) => {
                    if (response[0].status >= 400)
                        failure(fetchRequest, this.requestProcessingError(undefined, response));
                    else
                        success(fetchRequest, this.requestProcessingSuccess(response));
                })
                    .catch((error) => {
                    let fetchError = error;
                    if (typeof error === 'string') {
                        const errorMessage = error.toLowerCase();
                        fetchError = new Error(error);
                        if (!errorMessage.includes('timeout') && errorMessage.includes('cancel'))
                            fetchError.name = 'AbortError';
                    }
                    failure(fetchRequest, this.requestProcessingError(fetchError));
                });
            }))();
        }
        /**
         * Cancel active request processing.
         *
         * @param request - Reference to the service request which should be canceled.
         */
        cancelRequest(request) {
            const abortController = this.abortControllers[request.request.identifier];
            delete this.abortControllers[request.request.identifier];
            if (abortController)
                abortController.abort('Cancel request');
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
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
        requestProcessingSuccess(res) {
            var _a;
            const [response, body] = res;
            const responseBody = body.byteLength > 0 ? body : undefined;
            const contentLength = parseInt((_a = response.headers.get('Content-Length')) !== null && _a !== void 0 ? _a : '0', 10);
            const contentType = response.headers.get('Content-Type');
            const headers = {};
            // Copy Headers object content into plain Record.
            response.headers.forEach((value, key) => (headers[key.toLowerCase()] = value.toLowerCase()));
            return {
                type: 'request-process-success',
                clientIdentifier: '',
                identifier: '',
                url: '',
                response: { contentLength, contentType, headers, status: response.status, body: responseBody },
            };
        }
        /**
         * Create processing error event from service response.
         *
         * **Note:** The rest of information like `clientIdentifier`,`identifier`, and `url` will be added later for each
         * specific PubNub client state.
         *
         * @param [error] - Client-side request processing error (for example network issues).
         * @param [response] - Service error response (for example permissions error or malformed
         * payload) along with service body.
         * @returns Request processing error event object.
         */
        requestProcessingError(error, response) {
            // Use service response as error information source.
            if (response)
                return Object.assign(Object.assign({}, this.requestProcessingSuccess(response)), { type: 'request-process-error' });
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
        }
        /**
         * Create request timeout timer.
         *
         * **Note:** Native Fetch API doesn't support `timeout` out-of-box and {@link Promise} used to emulate it.
         *
         * @param request - Transport request which will time out after {@link TransportRequest.timeout|timeout} seconds.
         * @returns Promise which rejects after time out will fire.
         */
        requestTimeoutTimer(request) {
            return new Promise((_, reject) => {
                const timeoutId = setTimeout(() => {
                    // Clean up.
                    delete this.abortControllers[request.identifier];
                    clearTimeout(timeoutId);
                    reject(new Error('Request timeout'));
                }, request.timeout * 1000);
            });
        }
        /**
         * Percent-encode input string.
         *
         * **Note:** Encode content in accordance of the `PubNub` service requirements.
         *
         * @param input - Source string or number for encoding.
         * @returns Percent-encoded string.
         */
        encodeString(input) {
            return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
        }
    }

    class LeaveRequest extends PubNubSharedWorkerRequest {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructors ---------------------
        // --------------------------------------------------------
        // region Constructors
        /**
         * Create `leave` request from received _transparent_ transport request.
         *
         * @param request - Object with heartbeat transport request.
         * @param subscriptionKey - Subscribe REST API access key.
         * @param [accessToken] - Access token with permissions to announce presence on
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
         * @returns Initialized and ready to use `leave` request.
         */
        static fromTransportRequest(request, subscriptionKey, accessToken) {
            return new LeaveRequest(request, subscriptionKey, accessToken);
        }
        /**
         * Create `leave` request from received _transparent_ transport request.
         *
         * @param request - Object with heartbeat transport request.
         * @param subscriptionKey - Subscribe REST API access key.
         * @param [accessToken] - Access token with permissions to announce presence on
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
         */
        constructor(request, subscriptionKey, accessToken) {
            const allChannelGroups = LeaveRequest.channelGroupsFromRequest(request);
            const allChannels = LeaveRequest.channelsFromRequest(request);
            const channelGroups = allChannelGroups.filter((group) => !group.endsWith('-pnpres'));
            const channels = allChannels.filter((channel) => !channel.endsWith('-pnpres'));
            super(request, subscriptionKey, channelGroups, channels, request.queryParameters.uuid, accessToken);
            this.allChannelGroups = allChannelGroups;
            this.allChannels = allChannels;
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Extract list of channels for presence announcement from request URI path.
         *
         * @param request - Transport request from which should be extracted list of channels for presence announcement.
         *
         * @returns List of channel names (not percent-decoded) for which `leave` has been called.
         */
        static channelsFromRequest(request) {
            const channels = request.path.split('/')[6];
            return channels === ',' ? [] : channels.split(',').filter((name) => name.length > 0);
        }
        /**
         * Extract list of channel groups for presence announcement from request query.
         *
         * @param request - Transport request from which should be extracted list of channel groups for presence announcement.
         *
         * @returns List of channel group names (not percent-decoded) for which `leave` has been called.
         */
        static channelGroupsFromRequest(request) {
            if (!request.queryParameters || !request.queryParameters['channel-group'])
                return [];
            const group = request.queryParameters['channel-group'];
            return group.length === 0 ? [] : group.split(',').filter((name) => name.length > 0);
        }
    }

    /**
     * Aggregation timer timeout.
     *
     * Timeout used by the timer to postpone enqueued `subscribe` requests processing and let other clients for
     * same subscribe key send next subscribe loop request (to make aggregation more efficient).
     */
    const aggregationTimeout = 50;
    class SubscribeRequestsManager extends RequestsManager {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructors ---------------------
        // --------------------------------------------------------
        // region Constructors
        constructor(clientsManager) {
            super();
            this.clientsManager = clientsManager;
            /**
             * Map of aggregation identifiers to the requests which should be processed at once.
             *
             * `requests` key contains map of PubNub client identifier to requests created by it (usually there is only one at a
             * time).
             */
            this.delayedAggregationQueue = {};
            /**
             * Map of client identifiers to `AbortController` instances which is used to detach added listeners when PubNub client
             * unregister.
             */
            this.clientAbortControllers = {};
            /**
             * Map of unique user identifier (composed from multiple request object properties) to the aggregated subscription
             * state.
             */
            this.subscriptionStates = {};
            this.subscribeOnClientEvents(clientsManager);
        }
        // endregion
        // --------------------------------------------------------
        // --------------------- Aggregation ----------------------
        // --------------------------------------------------------
        // region Aggregation
        /**
         * Retrieve subscription state with which specific client is working.
         *
         * @param client - Reference to the PubNub client for which subscription state should be found.
         * @returns Reference to the subscription state if client has ongoing requests.
         */
        subscriptionStateForClient(client) {
            let state;
            // Search where `client` previously stored its requests.
            for (const identifier of Object.keys(this.delayedAggregationQueue)) {
                if (this.delayedAggregationQueue[identifier].requests[client.identifier]) {
                    state = this.subscriptionStates[identifier];
                    break;
                }
            }
            // Search in persistent states.
            if (!state) {
                Object.values(this.subscriptionStates).forEach((subscriptionState) => !state && (state = subscriptionState.requestsForClient(client).length ? subscriptionState : undefined));
            }
            return state;
        }
        /**
         * Move client between subscription states.
         *
         * This function used when PubNub client changed its identity (`userId`) and can't be aggregated with previous
         * requests.
         *
         * @param client - Reference to the PubNub client which should be moved to new state.
         */
        moveClient(client) {
            let requests = this.aggregateQueueForClient(client);
            // Check whether there is new requests from the client or requests in subscription state should be used instead.
            if (!requests.length) {
                Object.values(this.subscriptionStates).forEach((subscriptionState) => requests.length === 0 && (requests = subscriptionState.requestsForClient(client)));
            }
            // Provided client doesn't have enqueued for subscription state change or has any data in state itself.
            if (!requests.length)
                return;
            this.removeClient(client, false);
            this.enqueueForAggregation(client, requests);
        }
        /**
         * Remove unregistered / disconnected PubNub client from manager's state.
         *
         * @param client - Reference to the PubNub client which should be removed from state.
         * @param sendLeave - Whether client should send presence `leave` request for _free_ channels and groups or not.
         */
        removeClient(client, sendLeave) {
            this.removeFromAggregationQueue(client);
            const subscriptionState = this.subscriptionStateForClient(client);
            if (!subscriptionState)
                return;
            const clientSubscriptionState = subscriptionState.stateForClient(client);
            const clientStateForLeave = subscriptionState.uniqueStateForClient(client, clientSubscriptionState.channels, clientSubscriptionState.channelGroups);
            // Clean up client's data in subscription state.
            subscriptionState.beginChanges();
            subscriptionState.removeClient(client);
            subscriptionState.commitChanges();
            // Check whether there is any need to send `leave` request or not.
            if (!sendLeave || (!clientStateForLeave.channels.length && !clientStateForLeave.channelGroups.length))
                return;
            const request = this.leaveRequest(client, clientStateForLeave.channels, clientStateForLeave.channelGroups);
            if (!request)
                return;
            this.sendRequest(request, (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response), (fetchRequest, errorResponse) => request.handleProcessingError(fetchRequest, errorResponse));
        }
        /**
         * Retrieve aggregation queue for specific PubNub client.
         *
         * @param client - Reference to PubNub client for which subscribe requests queue should be retrieved.
         * @returns List of client's subscribe requests which is enqueued for aggregation.
         */
        aggregateQueueForClient(client) {
            let queue;
            for (const identifier of Object.keys(this.delayedAggregationQueue)) {
                if (this.delayedAggregationQueue[identifier].requests[client.identifier]) {
                    queue = this.delayedAggregationQueue[identifier];
                    break;
                }
            }
            return queue ? queue.requests[client.identifier] : [];
        }
        /**
         * Enqueue subscribe requests for aggregation after small delay.
         *
         * @param client - Reference to the PubNub client which created subscribe request.
         * @param enqueuedRequests - List of subscribe requests which should be placed into the queue.
         */
        enqueueForAggregation(client, enqueuedRequests) {
            const identifier = enqueuedRequests[0].asIdentifier;
            if (!this.delayedAggregationQueue[identifier]) {
                this.delayedAggregationQueue[identifier] = {
                    timeout: setTimeout(() => this.handleDelayedAggregation(identifier), aggregationTimeout),
                    requests: { [client.identifier]: enqueuedRequests },
                };
            }
            else {
                const requests = this.delayedAggregationQueue[identifier].requests;
                if (!requests[client.identifier])
                    requests[client.identifier] = enqueuedRequests;
                else
                    enqueuedRequests.forEach((request) => !requests[client.identifier].includes(request) && requests[client.identifier].push(request));
            }
        }
        /**
         * Remove specific or all `client` requests from delayed aggregation queue.
         *
         * @param client - Reference to the PubNub client which created subscribe request.
         * @param [request] - Subscribe request which should be removed from the queue.
         * @returns List of removed requests.
         */
        removeFromAggregationQueue(client, request) {
            let queue;
            let removedRequests = [];
            let queueIdentifier;
            if (request) {
                queueIdentifier = request.asIdentifier;
                queue = this.delayedAggregationQueue[queueIdentifier];
            }
            else {
                // Search where `client` previously stored its requests.
                for (const identifier of Object.keys(this.delayedAggregationQueue)) {
                    if (this.delayedAggregationQueue[identifier].requests[client.identifier]) {
                        queue = this.delayedAggregationQueue[identifier];
                        queueIdentifier = identifier;
                        break;
                    }
                }
            }
            if (!queueIdentifier || !queue)
                return removedRequests;
            if (!queue || !queue.requests[client.identifier])
                return [];
            if (request) {
                const requestIdx = queue.requests[client.identifier].indexOf(request);
                if (requestIdx >= 0) {
                    queue.requests[client.identifier].splice(requestIdx, 1);
                    if (queue.requests[client.identifier].length === 0)
                        delete queue.requests[client.identifier];
                    removedRequests = [request];
                }
            }
            else {
                removedRequests = [...queue.requests[client.identifier]];
                delete queue.requests[client.identifier];
            }
            if (Object.keys(queue.requests).length === 0 && queue.timeout) {
                clearTimeout(queue.timeout);
                delete this.delayedAggregationQueue[queueIdentifier];
            }
            return removedRequests;
        }
        /**
         * Handle delayed subscribe requests aggregation.
         *
         * @param identifier - Similar subscribe requests aggregation identifier.
         */
        handleDelayedAggregation(identifier) {
            if (!this.delayedAggregationQueue[identifier])
                return;
            let state = this.subscriptionStates[identifier];
            if (!state) {
                state = this.subscriptionStates[identifier] = new SubscriptionState();
                // Make sure to receive updates from subscription state.
                this.addListenerForSubscriptionStateEvents(state);
            }
            const requests = Object.values(this.delayedAggregationQueue[identifier].requests)
                .map((requests) => Object.values(requests))
                .flat();
            delete this.delayedAggregationQueue[identifier];
            state.beginChanges();
            requests.forEach((request) => state.addClientRequests(request.client, [request]));
            state.commitChanges();
        }
        // endregion
        // --------------------------------------------------------
        // ------------------- Event Handlers ---------------------
        // --------------------------------------------------------
        // region Event handlers
        /**
         * Listen for PubNub clients manager events which affects aggregated subscribe / heartbeat requests.
         *
         * @param clientsManager - Clients manager for which change in clients should be tracked.
         */
        subscribeOnClientEvents(clientsManager) {
            clientsManager.addEventListener(PubNubClientsManagerEvent.Registered, (evt) => {
                const { client } = evt;
                // Keep track of the client's listener abort controller.
                const abortController = new AbortController();
                this.clientAbortControllers[client.identifier] = abortController;
                client.addEventListener(PubNubClientEvent.Disconnect, () => this.removeClient(client, true), {
                    signal: abortController.signal,
                });
                client.addEventListener(PubNubClientEvent.IdentityChange, () => this.moveClient(client), {
                    signal: abortController.signal,
                });
                client.addEventListener(PubNubClientEvent.SendSubscribeRequest, (evt) => {
                    const event = evt;
                    this.enqueueForAggregation(event.client, [event.request]);
                }, { signal: abortController.signal });
                client.addEventListener(PubNubClientEvent.SendLeaveRequest, (evt) => {
                    const event = evt;
                    const request = this.patchedLeaveRequest(event.request);
                    if (!request)
                        return;
                    this.sendRequest(request, (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response), (fetchRequest, errorResponse) => request.handleProcessingError(fetchRequest, errorResponse));
                }, { signal: abortController.signal });
            });
            clientsManager.addEventListener(PubNubClientsManagerEvent.Unregistered, (evt) => {
                const { client, withLeave } = evt;
                // Remove all listeners added for the client.
                const abortController = this.clientAbortControllers[client.identifier];
                delete this.clientAbortControllers[client.identifier];
                if (abortController)
                    abortController.abort();
                // Update manager's state.
                this.removeClient(client, withLeave);
            });
        }
        /**
         * Listen for subscription state events.
         *
         * @param state - Reference to the subscription object for which listeners should be added.
         */
        addListenerForSubscriptionStateEvents(state) {
            state.addEventListener(SubscriptionStateEvent.Changed, (evt) => {
                const event = evt;
                // Cancel outdated ongoing service requests.
                event.canceledRequests.forEach((request) => this.cancelRequest(request));
                // Schedule new service requests processing.
                event.newRequests.forEach((request) => {
                    this.sendRequest(request, (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response), (fetchRequest, error) => request.handleProcessingError(fetchRequest, error), request.isInitialSubscribe && request.timetokenOverride !== '0'
                        ? (response) => this.patchInitialSubscribeResponse(response, request.timetokenOverride, request.timetokenRegionOverride)
                        : undefined);
                });
            });
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Create service `leave` request from client-provided request with channels and groups for removal.
         *
         * @param request - Original client-provided `leave` request.
         * @returns Service `leave` request.
         */
        patchedLeaveRequest(request) {
            const subscriptionState = this.subscriptionStateForClient(request.client);
            if (!subscriptionState) {
                // Something is wrong. Client doesn't have any active subscriptions.
                request.cancel();
                return;
            }
            // Filter list from channels and groups which is still in use.
            const clientStateForLeave = subscriptionState.uniqueStateForClient(request.client, request.channels, request.channelGroups);
            const serviceRequest = this.leaveRequest(request.client, clientStateForLeave.channels, clientStateForLeave.channelGroups);
            if (serviceRequest)
                request.serviceRequest = serviceRequest;
            return serviceRequest;
        }
        /**
         * Create service `leave` request for specific PubNub client with channels and groups for removal.
         *
         * @param client - Reference to the PubNub client whose credentials should be used for new request.
         * @param channels - List of channels which not used by any other clients and can be left.
         * @param channelGroups - List of channel groups which no used by any other clients and can be left.
         * @returns Service `leave` request.
         */
        leaveRequest(client, channels, channelGroups) {
            channels = channels
                .filter((channel) => !channel.endsWith('-pnpres'))
                .map((channel) => this.encodeString(channel))
                .sort();
            channelGroups = channelGroups
                .filter((channelGroup) => !channelGroup.endsWith('-pnpres'))
                .map((channelGroup) => this.encodeString(channelGroup))
                .sort();
            if (channels.length === 0 && channelGroups.length === 0)
                return undefined;
            const channelGroupsString = channelGroups.length > 0 ? channelGroups.join(',') : undefined;
            const channelsString = channels.length === 0 ? ',' : channels.join(',');
            const query = Object.assign(Object.assign({ instanceid: client.identifier, uuid: client.userId, requestid: uuidGenerator.createUUID() }, (client.accessToken ? { auth: client.accessToken.toString() } : {})), (channelGroupsString ? { 'channel-group': channelGroupsString } : {}));
            const transportRequest = {
                origin: client.origin,
                path: `/v2/presence/sub-key/${client.subKey}/channel/${channelsString}/leave`,
                queryParameters: query,
                method: TransportMethod.GET,
                headers: {},
                timeout: 10,
                cancellable: false,
                compressible: false,
                identifier: query.requestid,
            };
            return LeaveRequest.fromTransportRequest(transportRequest, client.subKey, client.accessToken);
        }
        /**
         * Patch subscribe service response with new timetoken and region.
         *
         * @param serverResponse - Original service response for patching.
         * @param timetoken - Original timetoken override value.
         * @param region - Original timetoken region override value.
         * @returns Patched subscribe REST API response.
         */
        patchInitialSubscribeResponse(serverResponse, timetoken, region) {
            if (timetoken === undefined || timetoken === '0' || serverResponse[0].status >= 400)
                return serverResponse;
            let json;
            const response = serverResponse[0];
            let decidedResponse = response;
            let body = serverResponse[1];
            try {
                json = JSON.parse(SubscribeRequestsManager.textDecoder.decode(body));
            }
            catch (error) {
                console.error(`Subscribe response parse error: ${error}`);
                return serverResponse;
            }
            // Replace server-provided timetoken.
            json.t.t = timetoken;
            if (region)
                json.t.r = parseInt(region, 10);
            try {
                body = SubscribeRequestsManager.textEncoder.encode(JSON.stringify(json)).buffer;
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
                console.error(`Subscribe serialization error: ${error}`);
                return serverResponse;
            }
            return body.byteLength > 0 ? [decidedResponse, body] : serverResponse;
        }
    }
    // --------------------------------------------------------
    // ---------------------- Information ---------------------
    // --------------------------------------------------------
    // region Information
    /**
     * Service response binary data decoder.
     */
    SubscribeRequestsManager.textDecoder = new TextDecoder();
    /**
     * Stringified to binary data encoder.
     */
    SubscribeRequestsManager.textEncoder = new TextEncoder();

    /**
     * Type with events which is dispatched by heartbeat state in response to client-provided requests and PubNub
     * client state change.
     */
    var HeartbeatStateEvent;
    (function (HeartbeatStateEvent) {
        /**
         * Heartbeat state ready to send another heartbeat.
         */
        HeartbeatStateEvent["Heartbeat"] = "heartbeat";
    })(HeartbeatStateEvent || (HeartbeatStateEvent = {}));
    /**
     * Dispatched by heartbeat state when new heartbeat can be sent.
     */
    class HeartbeatStateHeartbeatEvent extends CustomEvent {
        /**
         * Create heartbeat state heartbeat event.
         *
         * @param request - Aggregated heartbeat request which can be sent.
         */
        constructor(request) {
            super(HeartbeatStateEvent.Heartbeat, { detail: request });
        }
        /**
         * Retrieve aggregated heartbeat request which can be sent.
         *
         * @returns Aggregated heartbeat request which can be sent.
         */
        get request() {
            return this.detail;
        }
        /**
         * Create clone of heartbeat event to make it possible to forward event upstream.
         *
         * @returns Client heartbeat event.
         */
        clone() {
            return new HeartbeatStateHeartbeatEvent(this.request);
        }
    }

    class HeartbeatRequest extends PubNubSharedWorkerRequest {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructors ---------------------
        // --------------------------------------------------------
        // region Constructors
        /**
         * Create heartbeat request from received _transparent_ transport request.
         *
         * @param request - Object with heartbeat transport request.
         * @param subscriptionKey - Subscribe REST API access key.
         * @param [accessToken] - Access token with permissions to announce presence on
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
         * @returns Initialized and ready to use heartbeat request.
         */
        static fromTransportRequest(request, subscriptionKey, accessToken) {
            return new HeartbeatRequest(request, subscriptionKey, accessToken);
        }
        /**
         * Create heartbeat request from previously cached data.
         *
         * @param request - Object with subscribe transport request.
         * @param subscriptionKey - Subscribe REST API access key.
         * @param [aggregatedChannelGroups] - List of aggregated channel groups for the same user.
         * @param [aggregatedChannels] - List of aggregated channels for the same user.
         * @param [aggregatedState] - State aggregated for the same user.
         * @param [accessToken] - Access token with read permissions on
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
         * @retusns Initialized and ready to use heartbeat request.
         */
        static fromCachedState(request, subscriptionKey, aggregatedChannelGroups, aggregatedChannels, aggregatedState, accessToken) {
            // Update request channels list (if required).
            if (aggregatedChannels.length || aggregatedChannelGroups.length) {
                const pathComponents = request.path.split('/');
                pathComponents[6] = aggregatedChannels.length ? [...aggregatedChannels].sort().join(',') : ',';
                request.path = pathComponents.join('/');
            }
            // Update request channel groups list (if required).
            if (aggregatedChannelGroups.length)
                request.queryParameters['channel-group'] = [...aggregatedChannelGroups].sort().join(',');
            // Update request `state` (if required).
            if (aggregatedState && Object.keys(aggregatedState).length)
                request.queryParameters.state = JSON.stringify(aggregatedState);
            else
                delete request.queryParameters.aggregatedState;
            if (accessToken)
                request.queryParameters.auth = accessToken.toString();
            request.identifier = uuidGenerator.createUUID();
            return new HeartbeatRequest(request, subscriptionKey, accessToken);
        }
        /**
         * Create heartbeat request from received _transparent_ transport request.
         *
         * @param request - Object with heartbeat transport request.
         * @param subscriptionKey - Subscribe REST API access key.
         * @param [accessToken] - Access token with permissions to announce presence on
         * {@link PubNubSharedWorkerRequest.channels|channels} and
         * {@link PubNubSharedWorkerRequest.channelGroups|channelGroups}.
         */
        constructor(request, subscriptionKey, accessToken) {
            const channelGroups = HeartbeatRequest.channelGroupsFromRequest(request).filter((group) => !group.endsWith('-pnpres'));
            const channels = HeartbeatRequest.channelsFromRequest(request).filter((channel) => !channel.endsWith('-pnpres'));
            super(request, subscriptionKey, channelGroups, channels, request.queryParameters.uuid, accessToken);
            // Clean up `state` from objects which is not used with request (if needed).
            if (!request.queryParameters.state || request.queryParameters.state.length === 0)
                return;
            const state = JSON.parse(request.queryParameters.state);
            for (const objectName of Object.keys(state))
                if (!this.channels.includes(objectName) && !this.channelGroups.includes(objectName))
                    delete state[objectName];
            this.state = state;
        }
        // endregion
        // --------------------------------------------------------
        // ---------------------- Properties ----------------------
        // --------------------------------------------------------
        // region Properties
        /**
         * Represent heartbeat request as identifier.
         *
         * Generated identifier will be identical for requests created for the same user.
         */
        get asIdentifier() {
            const auth = this.accessToken ? this.accessToken.asIdentifier : undefined;
            return `${this.userId}-${this.subscribeKey}${auth ? `-${auth}` : ''}`;
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Extract list of channels for presence announcement from request URI path.
         *
         * @param request - Transport request from which should be extracted list of channels for presence announcement.
         *
         * @returns List of channel names (not percent-decoded) for which `heartbeat` has been called.
         */
        static channelsFromRequest(request) {
            const channels = request.path.split('/')[6];
            return channels === ',' ? [] : channels.split(',').filter((name) => name.length > 0);
        }
        /**
         * Extract list of channel groups for presence announcement from request query.
         *
         * @param request - Transport request from which should be extracted list of channel groups for presence announcement.
         *
         * @returns List of channel group names (not percent-decoded) for which `heartbeat` has been called.
         */
        static channelGroupsFromRequest(request) {
            if (!request.queryParameters || !request.queryParameters['channel-group'])
                return [];
            const group = request.queryParameters['channel-group'];
            return group.length === 0 ? [] : group.split(',').filter((name) => name.length > 0);
        }
    }

    class HeartbeatState extends EventTarget {
        constructor() {
            // --------------------------------------------------------
            // ---------------------- Information ---------------------
            // --------------------------------------------------------
            // region Information
            super(...arguments);
            /**
             * Map of client identifiers to their portion of data which affects heartbeat state.
             *
             * **Note:** This information removed only with {@link HeartbeatState.removeClient|removeClient} function call.
             */
            this.clientsState = {};
            /**
             * Map of client to its requests which is pending for service request processing results.
             */
            this.requests = {};
            /**
             * Time when previous heartbeat request has been done.
             */
            this.lastHeartbeatTimestamp = 0;
            /**
             * Stores whether automated _backup_ timer can fire or not.
             */
            this.canSendBackupHeartbeat = true;
            /**
             * Whether previous call failed with `Access Denied` error or not.
             */
            this.isAccessDeniedError = false;
            /**
             * Presence heartbeat interval.
             *
             * Value used to decide whether new request should be handled right away or should wait for _backup_ timer in state
             * to send aggregated request.
             */
            this._interval = 0;
            // endregion
        }
        // endregion
        // --------------------------------------------------------
        // --------------------- Properties -----------------------
        // --------------------------------------------------------
        // region Properties
        /**
         * Update presence heartbeat interval.
         *
         * @param value - New heartbeat interval.
         */
        set interval(value) {
            const changed = this._interval !== value;
            this._interval = value;
            if (!changed)
                return;
            // Restart timer if required.
            if (value === 0)
                this.stopTimer();
            else
                this.startTimer();
        }
        /**
         * Update access token which should be used for aggregated heartbeat requests.
         *
         * @param value - New access token for heartbeat requests.
         */
        set accessToken(value) {
            if (!value) {
                this._accessToken = value;
                return;
            }
            const accessTokens = Object.values(this.requests)
                .filter((request) => !!request.accessToken)
                .map((request) => request.accessToken);
            accessTokens.push(value);
            this._accessToken = accessTokens.sort(AccessToken.compare).pop();
            // Restart _backup_ heartbeat if previous call failed because of permissions error.
            if (this.isAccessDeniedError) {
                this.canSendBackupHeartbeat = true;
                this.startTimer(this.presenceTimerTimeout());
            }
        }
        // endregion
        // --------------------------------------------------------
        // ---------------------- Accessors -----------------------
        // --------------------------------------------------------
        // region Accessors
        /**
         * Retrieve portion of heartbeat state which is related to the specific client.
         *
         * @param client - Reference to the PubNub client for which state should be retrieved.
         * @returns PubNub client's state in heartbeat.
         */
        stateForClient(client) {
            if (!this.clientsState[client.identifier])
                return undefined;
            const clientState = this.clientsState[client.identifier];
            return clientState
                ? { channels: [...clientState.channels], channelGroups: [...clientState.channelGroups], state: clientState.state }
                : { channels: [], channelGroups: [] };
        }
        /**
         * Retrieve recent heartbeat request for the client.
         *
         * @param client - Reference to the client for which request should be retrieved.
         * @returns List of client's ongoing requests.
         */
        requestForClient(client) {
            return this.requests[client.identifier];
        }
        // endregion
        // --------------------------------------------------------
        // --------------------- Aggregation ----------------------
        // --------------------------------------------------------
        // region Aggregation
        /**
         * Add new client's request to the state.
         *
         * @param client - Reference to PubNub client which is adding new requests for processing.
         * @param request - New client-provided heartbeat request for processing.
         */
        addClientRequest(client, request) {
            this.requests[client.identifier] = request;
            this.clientsState[client.identifier] = { channels: request.channels, channelGroups: request.channelGroups };
            if (request.state)
                this.clientsState[client.identifier].state = Object.assign({}, request.state);
            // Update access token information (use the one which will provide permissions for longer period).
            const sortedTokens = Object.values(this.requests)
                .filter((request) => !!request.accessToken)
                .map((request) => request.accessToken)
                .sort(AccessToken.compare);
            if (sortedTokens && sortedTokens.length > 0)
                this._accessToken = sortedTokens.pop();
            this.sendAggregatedHeartbeat(request);
        }
        /**
         * Remove client and requests associated with it from the state.
         *
         * @param client - Reference to the PubNub client which should be removed.
         */
        removeClient(client) {
            delete this.clientsState[client.identifier];
            delete this.requests[client.identifier];
            // Stop backup timer if there is no more channels and groups left.
            if (Object.keys(this.clientsState).length === 0)
                this.stopTimer();
        }
        removeFromClientState(client, channels, channelGroups) {
            const clientState = this.clientsState[client.identifier];
            if (!clientState)
                return;
            clientState.channelGroups = clientState.channelGroups.filter((group) => !channelGroups.includes(group));
            clientState.channels = clientState.channels.filter((channel) => !channels.includes(channel));
            if (clientState.channels.length === 0 && clientState.channelGroups.length === 0) {
                this.removeClient(client);
                return;
            }
            // Clean up user's presence state from removed channels and groups.
            if (!clientState.state)
                return;
            Object.keys(clientState.state).forEach((key) => {
                if (!clientState.channels.includes(key) && !clientState.channelGroups.includes(key))
                    delete clientState.state[key];
            });
        }
        /**
         * Start "backup" presence heartbeat timer.
         *
         * @param targetInterval - Interval after which heartbeat request should be sent.
         */
        startTimer(targetInterval) {
            this.stopTimer();
            if (Object.keys(this.clientsState).length === 0)
                return;
            this.timeout = setTimeout(() => this.handlePresenceTimer(), (targetInterval !== null && targetInterval !== void 0 ? targetInterval : this._interval) * 1000);
        }
        /**
         * Stop "backup" presence heartbeat timer.
         */
        stopTimer() {
            if (this.timeout)
                clearTimeout(this.timeout);
            this.timeout = undefined;
        }
        /**
         * Send aggregated heartbeat request (if possible).
         *
         * @param [request] - Client provided request which tried to announce presence.
         */
        sendAggregatedHeartbeat(request) {
            if (this.lastHeartbeatTimestamp !== 0) {
                // Check whether it is too soon to send request or not.
                const expected = this.lastHeartbeatTimestamp + this._interval * 1000;
                let leeway = this._interval * 0.05;
                if (this._interval - leeway < 3)
                    leeway = 0;
                const current = Date.now();
                if (expected - current > leeway * 1000) {
                    if (request && this.previousRequestResult) {
                        request.handleProcessingStarted();
                        request.handleProcessingSuccess(request.asFetchRequest, this.previousRequestResult);
                    }
                    else if (!request)
                        return;
                }
            }
            const requests = Object.values(this.requests);
            const baseRequest = requests[Math.floor(Math.random() * requests.length)];
            const aggregatedRequest = Object.assign({}, baseRequest.request);
            let state = {};
            const channelGroups = new Set();
            const channels = new Set();
            Object.values(this.clientsState).forEach((clientState) => {
                if (clientState.state)
                    state = Object.assign(Object.assign({}, state), clientState.state);
                clientState.channelGroups.forEach(channelGroups.add, channelGroups);
                clientState.channels.forEach(channels.add, channels);
            });
            this.lastHeartbeatTimestamp = Date.now();
            const serviceRequest = HeartbeatRequest.fromCachedState(aggregatedRequest, requests[0].subscribeKey, [...channelGroups], [...channels], Object.keys(state).length > 0 ? state : undefined, this._accessToken);
            // Set service request for all client-provided requests without response.
            Object.values(this.requests).forEach((request) => !request.serviceRequest && (request.serviceRequest = serviceRequest));
            this.addListenersForRequest(serviceRequest);
            this.dispatchEvent(new HeartbeatStateHeartbeatEvent(serviceRequest));
            // Restart _backup_ timer after regular client-provided request triggered heartbeat.
            if (request)
                this.startTimer();
        }
        // endregion
        // --------------------------------------------------------
        // ------------------- Event Handlers ---------------------
        // --------------------------------------------------------
        // region Event handlers
        /**
         * Add listeners to the service request.
         *
         * Listeners used to capture last service success response and mark whether further _backup_ requests possible or not.
         *
         * @param request - Service `heartbeat` request for which events will be listened once.
         */
        addListenersForRequest(request) {
            const ac = new AbortController();
            const callback = (evt) => {
                // Clean up service request listeners.
                ac.abort();
                if (evt instanceof RequestSuccessEvent) {
                    const { response } = evt;
                    this.previousRequestResult = response;
                }
                else if (evt instanceof RequestErrorEvent) {
                    const { error } = evt;
                    this.canSendBackupHeartbeat = true;
                    this.isAccessDeniedError = false;
                    if (error.response && error.response.status >= 400 && error.response.status < 500) {
                        this.isAccessDeniedError = error.response.status === 403;
                        this.canSendBackupHeartbeat = false;
                    }
                }
            };
            request.addEventListener(PubNubSharedWorkerRequestEvents.Success, callback, { signal: ac.signal, once: true });
            request.addEventListener(PubNubSharedWorkerRequestEvents.Error, callback, { signal: ac.signal, once: true });
            request.addEventListener(PubNubSharedWorkerRequestEvents.Canceled, callback, { signal: ac.signal, once: true });
        }
        /**
         * Handle periodic _backup_ heartbeat timer.
         */
        handlePresenceTimer() {
            if (Object.keys(this.clientsState).length === 0 || !this.canSendBackupHeartbeat)
                return;
            const targetInterval = this.presenceTimerTimeout();
            this.sendAggregatedHeartbeat();
            this.startTimer(targetInterval);
        }
        /**
         * Compute timeout for _backup_ heartbeat timer.
         *
         * @returns Number of seconds after which new aggregated heartbeat request should be sent.
         */
        presenceTimerTimeout() {
            const timePassed = (Date.now() - this.lastHeartbeatTimestamp) / 1000;
            let targetInterval = this._interval;
            if (timePassed < targetInterval)
                targetInterval -= timePassed;
            if (targetInterval === this._interval)
                targetInterval += 0.05;
            targetInterval = Math.max(targetInterval, 3);
            return targetInterval;
        }
    }

    /**
     * Heartbeat requests manager responsible for heartbeat aggregation and backup of throttled clients (background tabs).
     *
     * On each heartbeat request from core PubNub client module manager will try to identify whether it is time to send it
     * and also will try to aggregate call for channels / groups for the same user.
     */
    class HeartbeatRequestsManager extends RequestsManager {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructors ---------------------
        // --------------------------------------------------------
        // region Constructors
        /**
         * Create heartbeat requests manager.
         *
         * @param clientsManager - Reference to the core PubNub clients manager to track their life-cycle and make
         * corresponding state changes.
         */
        constructor(clientsManager) {
            super();
            this.clientsManager = clientsManager;
            /**
             * Map of unique user identifier (composed from multiple request object properties) to the aggregated heartbeat state.
             * @private
             */
            this.heartbeatStates = {};
            /**
             * Map of client identifiers to `AbortController` instances which is used to detach added listeners when PubNub client
             * unregister.
             */
            this.clientAbortControllers = {};
            this.subscribeOnClientEvents(clientsManager);
        }
        // endregion
        // --------------------------------------------------------
        // --------------------- Aggregation ----------------------
        // --------------------------------------------------------
        // region Aggregation
        /**
         * Retrieve heartbeat state with which specific client is working.
         *
         * @param client - Reference to the PubNub client for which heartbeat state should be found.
         * @returns Reference to the heartbeat state if client has ongoing requests.
         */
        heartbeatStateForClient(client) {
            for (const heartbeatState of Object.values(this.heartbeatStates))
                if (heartbeatState.stateForClient(client))
                    return heartbeatState;
            return undefined;
        }
        /**
         * Move client between heartbeat states.
         *
         * This function used when PubNub client changed its identity (`userId`) and can't be aggregated with previous
         * requests.
         *
         * @param client - Reference to the PubNub client which should be moved to new state.
         */
        moveClient(client) {
            const state = this.heartbeatStateForClient(client);
            const request = state ? state.requestForClient(client) : undefined;
            if (!state || !request)
                return;
            this.removeClient(client);
            this.addClient(client, request);
        }
        /**
         * Add client-provided heartbeat request into heartbeat state for aggregation.
         *
         * @param client - Reference to the client which provided heartbeat request.
         * @param request - Reference to the heartbeat request which should be used in aggregation.
         */
        addClient(client, request) {
            var _a;
            const identifier = request.asIdentifier;
            let state = this.heartbeatStates[identifier];
            if (!state) {
                state = this.heartbeatStates[identifier] = new HeartbeatState();
                state.interval = (_a = client.heartbeatInterval) !== null && _a !== void 0 ? _a : 0;
                // Make sure to receive updates from heartbeat state.
                this.addListenerForHeartbeatStateEvents(state);
            }
            else if (client.heartbeatInterval &&
                state.interval > 0 &&
                client.heartbeatInterval > 0 &&
                client.heartbeatInterval < state.interval) {
                state.interval = client.heartbeatInterval;
            }
            state.addClientRequest(client, request);
        }
        /**
         * Remove client and its requests from further aggregated heartbeat calls.
         *
         * @param client - Reference to the PubNub client which should be removed from heartbeat state.
         */
        removeClient(client) {
            const state = this.heartbeatStateForClient(client);
            if (!state)
                return;
            state.removeClient(client);
        }
        // endregion
        // --------------------------------------------------------
        // ------------------- Event Handlers ---------------------
        // --------------------------------------------------------
        // region Event handlers
        /**
         * Listen for PubNub clients manager events which affects aggregated subscribe / heartbeat requests.
         *
         * @param clientsManager - Clients manager for which change in clients should be tracked.
         */
        subscribeOnClientEvents(clientsManager) {
            // Listen for new core PubNub client registrations.
            clientsManager.addEventListener(PubNubClientsManagerEvent.Registered, (evt) => {
                const { client } = evt;
                // Keep track of the client's listener abort controller.
                const abortController = new AbortController();
                this.clientAbortControllers[client.identifier] = abortController;
                client.addEventListener(PubNubClientEvent.Disconnect, () => this.removeClient(client), {
                    signal: abortController.signal,
                });
                client.addEventListener(PubNubClientEvent.IdentityChange, () => this.moveClient(client), {
                    signal: abortController.signal,
                });
                client.addEventListener(PubNubClientEvent.AuthChange, (evt) => {
                    const state = this.heartbeatStateForClient(client);
                    if (state)
                        state.accessToken = evt.newAuth;
                }, { signal: abortController.signal });
                client.addEventListener(PubNubClientEvent.HeartbeatIntervalChange, (evt) => {
                    var _a;
                    const event = evt;
                    const state = this.heartbeatStateForClient(client);
                    if (state)
                        state.interval = (_a = event.newInterval) !== null && _a !== void 0 ? _a : 0;
                }, { signal: abortController.signal });
                client.addEventListener(PubNubClientEvent.SendHeartbeatRequest, (evt) => this.addClient(client, evt.request), { signal: abortController.signal });
                client.addEventListener(PubNubClientEvent.SendLeaveRequest, (evt) => {
                    const { request } = evt;
                    const state = this.heartbeatStateForClient(client);
                    if (!state)
                        return;
                    state.removeFromClientState(client, request.channels, request.channelGroups);
                }, { signal: abortController.signal });
            });
            // Listen for core PubNub client module disappearance.
            clientsManager.addEventListener(PubNubClientsManagerEvent.Unregistered, (evt) => {
                const { client } = evt;
                // Remove all listeners added for the client.
                const abortController = this.clientAbortControllers[client.identifier];
                delete this.clientAbortControllers[client.identifier];
                if (abortController)
                    abortController.abort();
                this.removeClient(client);
            });
        }
        /**
         * Listen for heartbeat state events.
         *
         * @param state - Reference to the subscription object for which listeners should be added.
         */
        addListenerForHeartbeatStateEvents(state) {
            state.addEventListener(HeartbeatStateEvent.Heartbeat, (evt) => {
                const { request } = evt;
                this.sendRequest(request, (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response), (fetchRequest, error) => request.handleProcessingError(fetchRequest, error));
            });
        }
    }
    // --------------------------------------------------------
    // ---------------------- Information ---------------------
    // --------------------------------------------------------
    // region Information
    /**
     * Service response binary data decoder.
     */
    HeartbeatRequestsManager.textDecoder = new TextDecoder();

    /**
     * Enum with available log levels.
     */
    var LogLevel;
    (function (LogLevel) {
        /**
         * Used to notify about every last detail:
         * - function calls,
         * - full payloads,
         * - internal variables,
         * - state-machine hops.
         */
        LogLevel[LogLevel["Trace"] = 0] = "Trace";
        /**
         * Used to notify about broad strokes of your SDK’s logic:
         * - inputs/outputs to public methods,
         * - network request
         * - network response
         * - decision branches.
         */
        LogLevel[LogLevel["Debug"] = 1] = "Debug";
        /**
         * Used to notify summary of what the SDK is doing under the hood:
         * - initialized,
         * - connected,
         * - entity created.
         */
        LogLevel[LogLevel["Info"] = 2] = "Info";
        /**
         * Used to notify about non-fatal events:
         * - deprecations,
         * - request retries.
         */
        LogLevel[LogLevel["Warn"] = 3] = "Warn";
        /**
         * Used to notify about:
         * - exceptions,
         * - HTTP failures,
         * - invalid states.
         */
        LogLevel[LogLevel["Error"] = 4] = "Error";
        /**
         * Logging disabled.
         */
        LogLevel[LogLevel["None"] = 5] = "None";
    })(LogLevel || (LogLevel = {}));

    /**
     * Custom {@link Logger} implementation to send logs to the core PubNub client module from the shared worker context.
     */
    class ClientLogger {
        /**
         * Create logger for specific PubNub client representation object.
         *
         * @param minLogLevel - Minimum messages log level to be logged.
         * @param port - Message port for two-way communication with core PunNub client module.
         */
        constructor(minLogLevel, port) {
            this.minLogLevel = minLogLevel;
            this.port = port;
        }
        /**
         * Process a `debug` level message.
         *
         * @param message - Message which should be handled by custom logger implementation.
         */
        debug(message) {
            this.log(message, LogLevel.Debug);
        }
        /**
         * Process a `error` level message.
         *
         * @param message - Message which should be handled by custom logger implementation.
         */
        error(message) {
            this.log(message, LogLevel.Error);
        }
        /**
         * Process an `info` level message.
         *
         * @param message - Message which should be handled by custom logger implementation.
         */
        info(message) {
            this.log(message, LogLevel.Info);
        }
        /**
         * Process a `trace` level message.
         *
         * @param message - Message which should be handled by custom logger implementation.
         */
        trace(message) {
            this.log(message, LogLevel.Trace);
        }
        /**
         * Process an `warn` level message.
         *
         * @param message - Message which should be handled by custom logger implementation.
         */
        warn(message) {
            this.log(message, LogLevel.Warn);
        }
        /**
         * Send log entry to the core PubNub client module.
         *
         * @param message - Object which should be sent to the core PubNub client module.
         * @param level - Log entry level (will be handled by if core PunNub client module minimum log level matches).
         */
        log(message, level) {
            // Discard logged message if logger not enabled.
            if (level < this.minLogLevel)
                return;
            let entry;
            if (typeof message === 'string')
                entry = { messageType: 'text', message };
            else if (typeof message === 'function')
                entry = message();
            else
                entry = message;
            entry.level = level;
            try {
                this.port.postMessage({ type: 'shared-worker-console-log', message: entry });
            }
            catch (error) {
                if (this.minLogLevel !== LogLevel.None)
                    console.error(`[SharedWorker] Unable send message using message port: ${error}`);
            }
        }
    }

    /**
     * PubNub client representation in Shared Worker context.
     */
    class PubNubClient extends EventTarget {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructors ---------------------
        // --------------------------------------------------------
        // region Constructors
        /**
         * Create PubNub client.
         *
         * @param identifier - Unique PubNub client identifier.
         * @param subKey - Subscribe REST API access key.
         * @param userId - Unique identifier of the user currently configured for the PubNub client.
         * @param port - Message port for two-way communication with core PubNub client module.
         * @param logLevel - Minimum messages log level which should be passed to the `Subscription` worker logger.
         * @param [heartbeatInterval] - Interval that is used to announce a user's presence on channels/groups.
         */
        constructor(identifier, subKey, userId, port, logLevel, heartbeatInterval) {
            super();
            this.identifier = identifier;
            this.subKey = subKey;
            this.userId = userId;
            this.port = port;
            // --------------------------------------------------------
            // ---------------------- Information ---------------------
            // --------------------------------------------------------
            // region Information
            /**
             * Map of ongoing PubNub client requests.
             *
             * Unique request identifiers mapped to the requests requested by the core PubNub client module.
             */
            this.requests = {};
            /**
             * Controller, which is used on PubNub client unregister event to clean up listeners.
             */
            this.listenerAbortController = new AbortController();
            /**
             * List of subscription channel groups after previous subscribe request.
             *
             * **Note:** Keep a local cache to reduce the amount of parsing with each received subscribe send request.
             */
            this.cachedSubscriptionChannelGroups = [];
            /**
             * List of subscription channels after previous subscribe request.
             *
             * **Note:** Keep a local cache to reduce the amount of parsing with each received subscribe send request.
             */
            this.cachedSubscriptionChannels = [];
            this.logger = new ClientLogger(logLevel, this.port);
            this._heartbeatInterval = heartbeatInterval;
            this.subscribeOnEvents();
        }
        /**
         * Clean up resources used by this PubNub client.
         */
        invalidate(dispatchEvent = false) {
            // Remove the client's listeners.
            this.listenerAbortController.abort();
            this.cancelRequests();
        }
        // endregion
        // --------------------------------------------------------
        // ---------------------- Properties ----------------------
        // --------------------------------------------------------
        // region Properties
        /**
         * Retrieve origin which is used to access PubNub REST API.
         *
         * @returns Origin which is used to access PubNub REST API.
         */
        get origin() {
            var _a;
            return (_a = this._origin) !== null && _a !== void 0 ? _a : '';
        }
        /**
         * Retrieve heartbeat interval, which is used to announce a user's presence on channels/groups.
         *
         * @returns Heartbeat interval, which is used to announce a user's presence on channels/groups.
         */
        get heartbeatInterval() {
            return this._heartbeatInterval;
        }
        /**
         * Retrieve an access token to have `read` access to resources used by this client.
         *
         * @returns Access token to have `read` access to resources used by this client.
         */
        get accessToken() {
            return this._accessToken;
        }
        /**
         * Retrieve the last time, the core PubNub client module responded with the `PONG` event.
         *
         * @returns Last time, the core PubNub client module responded with the `PONG` event.
         */
        get lastPongEvent() {
            return this._lastPongEvent;
        }
        // endregion
        // --------------------------------------------------------
        // --------------------- Communication --------------------
        // --------------------------------------------------------
        // region Communication
        /**
         * Post event to the core PubNub client module.
         *
         * @param event - Subscription worker event payload.
         * @returns `true` if the event has been sent without any issues.
         */
        postEvent(event) {
            try {
                this.port.postMessage(event);
                return true;
            }
            catch (error) {
                this.logger.error(`Unable send message using message port: ${error}`);
            }
            return false;
        }
        // endregion
        // --------------------------------------------------------
        // -------------------- Event handlers --------------------
        // --------------------------------------------------------
        // region Event handlers
        /**
         * Subscribe to client-specific signals from the core PubNub client module.
         */
        subscribeOnEvents() {
            this.port.addEventListener('message', (event) => {
                if (event.data.type === 'client-unregister')
                    this.handleUnregisterEvent();
                else if (event.data.type === 'client-update')
                    this.handleConfigurationUpdateEvent(event.data);
                else if (event.data.type === 'send-request')
                    this.handleSendRequestEvent(event.data);
                else if (event.data.type === 'cancel-request')
                    this.handleCancelRequestEvent(event.data);
                else if (event.data.type === 'client-disconnect')
                    this.handleDisconnectEvent();
                else if (event.data.type === 'client-pong')
                    this.handlePongEvent();
            }, { signal: this.listenerAbortController.signal });
        }
        /**
         * Handle PubNub client unregister event.
         *
         * During unregister handling, the following changes will happen:
         * - remove from the clients hash map ({@link PubNubClientsManager|clients manager})
         * - reset long-poll request (remove channels/groups that have been used only by this client)
         * - stop backup heartbeat timer
         */
        handleUnregisterEvent() {
            this.invalidate();
            this.dispatchEvent(new PubNubClientUnregisterEvent(this));
        }
        /**
         * Update client's configuration.
         *
         * During configuration update handling, the following changes may happen (depending on the changed data):
         * - reset long-poll request (remove channels/groups that have been used only by this client from active request) on
         *   `userID` change.
         * - heartbeat will be sent immediately on `userID` change (to announce new user presence). **Note:** proper flow will
         *   be `unsubscribeAll` and then, with changed `userID` subscribe back, but the code will handle hard reset as well.
         * - _backup_ heartbeat timer reschedule in on `heartbeatInterval` change.
         *
         * @param event - Object with up-to-date client settings, which should be reflected in SharedWorker's state for the
         * registered client.
         */
        handleConfigurationUpdateEvent(event) {
            const { userId, accessToken: authKey, preProcessedToken: token, heartbeatInterval, workerLogLevel } = event;
            this.logger.minLogLevel = workerLogLevel;
            this.logger.debug(() => ({
                messageType: 'object',
                message: { userId, authKey, token, heartbeatInterval, workerLogLevel },
                details: 'Update client configuration with parameters:',
            }));
            // Check whether authentication information has been changed or not.
            // Important: If changed, this should be notified before a potential identity change event.
            if (authKey) {
                const accessToken = new AccessToken(authKey, (token !== null && token !== void 0 ? token : {}).token, (token !== null && token !== void 0 ? token : {}).expiration);
                // Check whether the access token really changed or not.
                if (!this.accessToken || !accessToken.equalTo(this.accessToken)) {
                    const oldValue = this.accessToken;
                    this._accessToken = accessToken;
                    // Make sure that all ongoing subscribe (usually should be only one at a time) requests use proper
                    // `accessToken`.
                    Object.values(this.requests)
                        .filter((request) => !request.completed && request instanceof SubscribeRequest)
                        .forEach((request) => (request.accessToken = accessToken));
                    this.dispatchEvent(new PubNubClientAuthChangeEvent(this, accessToken, oldValue));
                }
            }
            // Check whether PubNub client identity has been changed or not.
            if (this.userId !== userId) {
                const oldValue = this.userId;
                this.userId = userId;
                // Make sure that all ongoing subscribe (usually should be only one at a time) requests use proper `userId`.
                // **Note:** Core PubNub client module docs have a warning saying that `userId` should be changed only after
                // unsubscribe/disconnect to properly update the user's presence.
                Object.values(this.requests)
                    .filter((request) => !request.completed && request instanceof SubscribeRequest)
                    .forEach((request) => (request.userId = userId));
                this.dispatchEvent(new PubNubClientIdentityChangeEvent(this, oldValue, userId));
            }
            if (this._heartbeatInterval !== heartbeatInterval) {
                const oldValue = this._heartbeatInterval;
                this._heartbeatInterval = heartbeatInterval;
                this.dispatchEvent(new PubNubClientHeartbeatIntervalChangeEvent(this, heartbeatInterval, oldValue));
            }
        }
        /**
         * Handle requests send request from the core PubNub client module.
         *
         * @param data - Object with received request details.
         */
        handleSendRequestEvent(data) {
            let request;
            if (data.request.path.startsWith('/v2/subscribe')) {
                if (SubscribeRequest.useCachedState(data.request) &&
                    (this.cachedSubscriptionChannelGroups.length || this.cachedSubscriptionChannels.length)) {
                    request = SubscribeRequest.fromCachedState(data.request, this.subKey, this.cachedSubscriptionChannelGroups, this.cachedSubscriptionChannels, this.cachedSubscriptionState, this.accessToken);
                }
                else {
                    request = SubscribeRequest.fromTransportRequest(data.request, this.subKey, this.accessToken);
                    // Update the cached client's subscription state.
                    this.cachedSubscriptionChannelGroups = [...request.channelGroups];
                    this.cachedSubscriptionChannels = [...request.channels];
                    if (request.state)
                        this.cachedSubscriptionState = Object.assign({}, request.state);
                    else
                        this.cachedSubscriptionState = undefined;
                }
            }
            else if (data.request.path.endsWith('/heartbeat'))
                request = HeartbeatRequest.fromTransportRequest(data.request, this.subKey, this.accessToken);
            else
                request = LeaveRequest.fromTransportRequest(data.request, this.subKey, this.accessToken);
            request.client = this;
            this.requests[request.request.identifier] = request;
            if (!this._origin)
                this._origin = request.origin;
            // Set client state cleanup on request processing completion (with any outcome).
            this.listenRequestCompletion(request);
            // Notify request managers about new client-provided request.
            this.dispatchEvent(this.eventWithRequest(request));
        }
        /**
         * Handle on-demand request cancellation.
         *
         * @param data - Object with canceled request information.
         */
        handleCancelRequestEvent(data) {
            if (!this.requests[data.identifier])
                return;
            this.requests[data.identifier].cancel();
        }
        /**
         * Handle PubNub client disconnect event.
         *
         * During disconnection handling, the following changes will happen:
         * - reset subscription state ({@link SubscribeRequestsManager|subscription requests manager})
         * - stop backup heartbeat timer
         * - reset heartbeat state ({@link HeartbeatRequestsManager|heartbeat requests manager})
         */
        handleDisconnectEvent() {
            this.dispatchEvent(new PubNubClientDisconnectEvent(this));
        }
        /**
         * Handle ping-pong response from the core PubNub client module.
         */
        handlePongEvent() {
            this._lastPongEvent = Date.now() / 1000;
        }
        /**
         * Listen for any request outcome to clean
         *
         * @param request - Request for which processing outcome should be observed.
         */
        listenRequestCompletion(request) {
            const ac = new AbortController();
            const callback = (evt) => {
                delete this.requests[request.request.identifier];
                ac.abort();
                if (evt instanceof RequestSuccessEvent)
                    this.postEvent(evt.response);
                else if (evt instanceof RequestErrorEvent)
                    this.postEvent(evt.error);
                else if (evt instanceof RequestCancelEvent)
                    this.postEvent(this.requestCancelError(request));
            };
            request.addEventListener(PubNubSharedWorkerRequestEvents.Success, callback, { signal: ac.signal, once: true });
            request.addEventListener(PubNubSharedWorkerRequestEvents.Error, callback, { signal: ac.signal, once: true });
            request.addEventListener(PubNubSharedWorkerRequestEvents.Canceled, callback, { signal: ac.signal, once: true });
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Requests -----------------------
        // --------------------------------------------------------
        // region Requests
        /**
         * Cancel any active requests.
         *
         * **Note:** Cancellation will dispatch the event handled in `listenRequestCompletion` and remove `request` from the
         * PubNub client requests' list.
         */
        cancelRequests() {
            Object.values(this.requests).forEach((request) => request.cancel());
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Wrap `request` into corresponding event for dispatching.
         *
         * @param request - Request which should be used to identify event type and stored in it.
         */
        eventWithRequest(request) {
            let event;
            if (request instanceof SubscribeRequest)
                event = new PubNubClientSendSubscribeEvent(this, request);
            else if (request instanceof HeartbeatRequest)
                event = new PubNubClientSendHeartbeatEvent(this, request);
            else
                event = new PubNubClientSendLeaveEvent(this, request);
            return event;
        }
        /**
         * Create request cancellation response.
         *
         * @param request - Reference on client-provided request for which payload should be prepared.
         * @returns Object which will be treated as cancel response on core PubNub client module side.
         */
        requestCancelError(request) {
            return {
                type: 'request-process-error',
                clientIdentifier: this.identifier,
                identifier: request.request.identifier,
                url: request.asFetchRequest.url,
                error: { name: 'AbortError', type: 'ABORTED', message: 'Request aborted' },
            };
        }
    }

    class PubNubClientsManager extends EventTarget {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructors ---------------------
        // --------------------------------------------------------
        // region Constructors
        /**
         * Create PubNub clients manager.
         *
         * @param sharedWorkerIdentifier - Unique `Subscription` worker identifier which will work with clients.
         */
        constructor(sharedWorkerIdentifier) {
            super();
            this.sharedWorkerIdentifier = sharedWorkerIdentifier;
            // --------------------------------------------------------
            // ---------------------- Information ---------------------
            // --------------------------------------------------------
            // region Information
            /**
             * Map of started `PING` timeouts per-subscription key.
             */
            this.timeouts = {};
            /**
             * Map of previously created PubNub clients.
             */
            this.clients = {};
            /**
             * Map of previously created PubNub clients to the corresponding subscription key.
             */
            this.clientBySubscribeKey = {};
        }
        // endregion
        // --------------------------------------------------------
        // ----------------- Client registration ------------------
        // --------------------------------------------------------
        // region Client registration
        /**
         * Create PubNub client.
         *
         * Function called in response to the `client-register` from the core PubNub client module.
         *
         * @param event - Registration event with base PubNub client information.
         * @param port - Message port for two-way communication with core PunNub client module.
         * @returns New PubNub client or existing from the cache.
         */
        createClient(event, port) {
            var _a;
            if (this.clients[event.clientIdentifier])
                return this.clients[event.clientIdentifier];
            const client = new PubNubClient(event.clientIdentifier, event.subscriptionKey, event.userId, port, event.workerLogLevel, event.heartbeatInterval);
            this.registerClient(client);
            // Start offline PubNub clients checks (ping-pong).
            if (event.workerOfflineClientsCheckInterval) {
                this.startClientTimeoutCheck(event.subscriptionKey, event.workerOfflineClientsCheckInterval, (_a = event.workerUnsubscribeOfflineClients) !== null && _a !== void 0 ? _a : false);
            }
            return client;
        }
        /**
         * Store PubNub client in manager's internal state.
         *
         * @param client - Freshly created PubNub client which should be registered.
         */
        registerClient(client) {
            this.clients[client.identifier] = { client, abortController: new AbortController() };
            // Associate client with subscription key.
            if (!this.clientBySubscribeKey[client.subKey])
                this.clientBySubscribeKey[client.subKey] = [client];
            else
                this.clientBySubscribeKey[client.subKey].push(client);
            this.forEachClient(client.subKey, (subKeyClient) => subKeyClient.logger.debug(`'${client.identifier}' client registered with '${this.sharedWorkerIdentifier}' shared worker (${this.clientBySubscribeKey[client.subKey].length} active clients).`));
            this.subscribeOnClientEvents(client);
            // Notify other components that new client is registered and ready for usage.
            this.dispatchEvent(new PubNubClientManagerRegisterEvent(client));
        }
        /**
         * Remove PubNub client from manager's internal state.
         *
         * @param client - Previously created PubNub client which should be removed.
         * @param withLeave - Whether `leave` request should be sent or not.
         */
        unregisterClient(client, withLeave = false) {
            if (!this.clients[client.identifier])
                return;
            // Make sure to detach all listeners for this `client`.
            this.clients[client.identifier].abortController.abort();
            delete this.clients[client.identifier];
            const clientsBySubscribeKey = this.clientBySubscribeKey[client.subKey];
            if (clientsBySubscribeKey) {
                const clientIdx = clientsBySubscribeKey.indexOf(client);
                clientsBySubscribeKey.splice(clientIdx, 1);
                if (clientsBySubscribeKey.length === 0) {
                    delete this.clientBySubscribeKey[client.subKey];
                    this.stopClientTimeoutCheck(client);
                }
            }
            this.forEachClient(client.subKey, (subKeyClient) => subKeyClient.logger.debug(`'${this.sharedWorkerIdentifier}' shared worker unregistered '${client.identifier}' client (${this.clientBySubscribeKey[client.subKey].length} active clients).`));
            // Notify other components that client is unregistered and non-operational anymore.
            this.dispatchEvent(new PubNubClientManagerUnregisterEvent(client, withLeave));
        }
        // endregion
        // --------------------------------------------------------
        // ----------------- Availability check -------------------
        // --------------------------------------------------------
        // region Availability check
        /**
         * Start timer for _timeout_ PubNub client checks.
         *
         * @param subKey - Subscription key to get list of PubNub clients which should be checked.
         * @param interval - Interval at which _timeout_ check should be done.
         * @param unsubscribeOffline - Whether _timeout_ (or _offline_) PubNub clients should send `leave` request before
         * invalidation or not.
         */
        startClientTimeoutCheck(subKey, interval, unsubscribeOffline) {
            if (this.timeouts[subKey])
                return;
            this.forEachClient(subKey, (client) => client.logger.debug(`Setup PubNub client ping for every ${interval} seconds.`));
            this.timeouts[subKey] = {
                interval,
                unsubscribeOffline,
                timeout: setTimeout(() => this.handleTimeoutCheck(subKey), interval * 500 - 1),
            };
        }
        /**
         * Stop _timeout_ (or _offline_) PubNub clients pinging.
         *
         * **Note:** This method used only when all clients for specific subscription key has been unregistered.
         *
         * @param client - PubNub client with which last client related by subscription key has been removed.
         */
        stopClientTimeoutCheck(client) {
            if (!this.timeouts[client.subKey])
                return;
            if (this.timeouts[client.subKey].timeout)
                clearTimeout(this.timeouts[client.subKey].timeout);
            delete this.timeouts[client.subKey];
        }
        /**
         * Handle periodic PubNub client timeout check.
         *
         * @param subKey - Subscription key to get list of PubNub clients which should be checked.
         */
        handleTimeoutCheck(subKey) {
            if (!this.timeouts[subKey])
                return;
            const interval = this.timeouts[subKey].interval;
            [...this.clientBySubscribeKey[subKey]].forEach((client) => {
                if (client.lastPingRequest &&
                    (!client.lastPongEvent || Math.abs(client.lastPongEvent - client.lastPingRequest) > interval * 0.5)) {
                    this.unregisterClient(client, this.timeouts[subKey].unsubscribeOffline);
                    // Notify other clients with same subscription key that one of them became inactive.
                    this.forEachClient(subKey, (subKeyClient) => {
                        if (subKeyClient.identifier !== client.identifier)
                            subKeyClient.logger.debug(`'${client.identifier}' client is inactive. Invalidating...`);
                    });
                }
                if (this.clients[client.identifier]) {
                    client.lastPingRequest = new Date().getTime() / 1000;
                    client.postEvent({ type: 'shared-worker-ping' });
                }
            });
            // Restart PubNub clients timeout check timer.
            if (this.timeouts[subKey])
                this.timeouts[subKey].timeout = setTimeout(() => this.handleTimeoutCheck(subKey), interval * 500);
        }
        // endregion
        // --------------------------------------------------------
        // ------------------- Event Handlers ---------------------
        // --------------------------------------------------------
        // region Event handlers
        /**
         * Listen for PubNub client events which affects aggregated subscribe / heartbeat requests.
         *
         * @param client - PubNub client for which event should be listened.
         */
        subscribeOnClientEvents(client) {
            client.addEventListener(PubNubClientEvent.Unregister, () => this.unregisterClient(client, this.timeouts[client.subKey] ? this.timeouts[client.subKey].unsubscribeOffline : false), { signal: this.clients[client.identifier].abortController.signal, once: true });
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Call callback function for all PubNub clients which has similar `subscribeKey`.
         *
         * @param subKey - Subscription key for which list of clients should be retrieved.
         * @param callback - Function which will be called for each clients list entry.
         */
        forEachClient(subKey, callback) {
            if (!this.clientBySubscribeKey[subKey])
                return;
            this.clientBySubscribeKey[subKey].forEach(callback);
        }
    }

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
     * Unique shared worker instance identifier.
     */
    const sharedWorkerIdentifier = uuidGenerator.createUUID();
    const clientsManager = new PubNubClientsManager(sharedWorkerIdentifier);
    new SubscribeRequestsManager(clientsManager);
    new HeartbeatRequestsManager(clientsManager);
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
        event.ports.forEach((receiver) => {
            receiver.start();
            receiver.onmessage = (event) => {
                const data = event.data;
                if (data.type === 'client-register')
                    clientsManager.createClient(data, receiver);
            };
            receiver.postMessage({ type: 'shared-worker-connected' });
        });
    };
    // endregion

}));
