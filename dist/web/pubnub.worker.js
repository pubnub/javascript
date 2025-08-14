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
         */
        PubNubClientEvent["IdentityChange"] = "identityChange";
        /**
         * Authentication token change event.
         *
         * On authentication token change for proper further operation expected following actions:
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
         * Core PubNub client module request to _cancel_ specific `subscribe` request.
         */
        PubNubClientEvent["CancelSubscribeRequest"] = "cancelSubscribeRequest";
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
         * Create a clone of `unregister` event to make it possible to forward event upstream.
         *
         * @returns Clone of `unregister` event.
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
         * Create a clone of `disconnect` event to make it possible to forward event upstream.
         *
         * @returns Clone of `disconnect` event.
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
         * Create a clone of `identity` _change_ event to make it possible to forward event upstream.
         *
         * @returns Clone of `identity` _change_ event.
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
         * @param [newAuth] - Authentication which will used by the `client`.
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
         * Create a clone of `authentication` _change_ event to make it possible to forward event upstream.
         *
         * @returns Clone `authentication` _change_ event.
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
         * Create a clone of the `heartbeat interval` _change_ event to make it possible to forward the event upstream.
         *
         * @returns Clone of `heartbeat interval` _change_ event.
         */
        clone() {
            return new PubNubClientHeartbeatIntervalChangeEvent(this.client, this.newInterval, this.oldInterval);
        }
    }
    /**
     * Dispatched when the core PubNub client module requested to _send_ a `subscribe` request.
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
         * Create clone of _send_ `subscribe` request event to make it possible to forward event upstream.
         *
         * @returns Clone of _send_ `subscribe` request event.
         */
        clone() {
            return new PubNubClientSendSubscribeEvent(this.client, this.request);
        }
    }
    /**
     * Dispatched when the core PubNub client module requested to _cancel_ `subscribe` request.
     */
    class PubNubClientCancelSubscribeEvent extends BasePubNubClientEvent {
        /**
         * Create `subscribe` request _cancel_ event.
         *
         * @param client - Reference to the PubNub client which requested to _send_ request.
         * @param request - Subscription request object.
         */
        constructor(client, request) {
            super(PubNubClientEvent.CancelSubscribeRequest, { detail: { client, request } });
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
         * Create clone of _cancel_ `subscribe` request event to make it possible to forward event upstream.
         *
         * @returns Clone of _cancel_ `subscribe` request event.
         */
        clone() {
            return new PubNubClientCancelSubscribeEvent(this.client, this.request);
        }
    }
    /**
     * Dispatched when the core PubNub client module requested to _send_ `heartbeat` request.
     */
    class PubNubClientSendHeartbeatEvent extends BasePubNubClientEvent {
        /**
         * Create `heartbeat` request _send_ event.
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
         * Create clone of _send_ `heartbeat` request event to make it possible to forward event upstream.
         *
         * @returns Clone of _send_ `heartbeat` request event.
         */
        clone() {
            return new PubNubClientSendHeartbeatEvent(this.client, this.request);
        }
    }
    /**
     * Dispatched when the core PubNub client module requested to _send_ `leave` request.
     */
    class PubNubClientSendLeaveEvent extends BasePubNubClientEvent {
        /**
         * Create `leave` request _send_ event.
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
         * Create clone of _send_ `leave` request event to make it possible to forward event upstream.
         *
         * @returns Clone of _send_ `leave` request event.
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
        /**
         * Subscription state has been invalidated after all clients' state was removed from it.
         */
        SubscriptionStateEvent["Invalidated"] = "invalidated";
    })(SubscriptionStateEvent || (SubscriptionStateEvent = {}));
    /**
     * Dispatched by subscription state when state and service requests are changed.
     */
    class SubscriptionStateChangeEvent extends CustomEvent {
        /**
         * Create subscription state change event.
         *
         * @param withInitialResponse - List of initial `client`-provided {@link SubscribeRequest|subscribe} requests with
         * timetokens and regions that should be returned right away.
         * @param newRequests - List of new service requests which need to be scheduled for processing.
         * @param canceledRequests - List of previously scheduled service requests which should be cancelled.
         * @param leaveRequest - Request which should be used to announce `leave` from part of the channels and groups.
         */
        constructor(withInitialResponse, newRequests, canceledRequests, leaveRequest) {
            super(SubscriptionStateEvent.Changed, {
                detail: { withInitialResponse, newRequests, canceledRequests, leaveRequest },
            });
        }
        /**
         * Retrieve list of initial `client`-provided {@link SubscribeRequest|subscribe} requests with timetokens and regions
         * that should be returned right away.
         *
         * @returns List of initial `client`-provided {@link SubscribeRequest|subscribe} requests with timetokens and regions
         * that should be returned right away.
         */
        get requestsWithInitialResponse() {
            return this.detail.withInitialResponse;
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
         * Retrieve request which should be used to announce `leave` from part of the channels and groups.
         *
         * @returns Request which should be used to announce `leave` from part of the channels and groups.
         */
        get leaveRequest() {
            return this.detail.leaveRequest;
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
            return new SubscriptionStateChangeEvent(this.requestsWithInitialResponse, this.newRequests, this.canceledRequests, this.leaveRequest);
        }
    }
    /**
     * Dispatched by subscription state when it has been invalidated.
     */
    class SubscriptionStateInvalidateEvent extends CustomEvent {
        /**
         * Create subscription state invalidation event.
         */
        constructor() {
            super(SubscriptionStateEvent.Invalidated);
        }
        /**
         * Create clone of subscription state change event to make it possible to forward event upstream.
         *
         * @returns Client subscription state change event.
         */
        clone() {
            return new SubscriptionStateInvalidateEvent();
        }
    }

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
         * @param request - Custom requests with this event should be cloned.
         * @returns Client request processing start event.
         */
        clone(request) {
            return new RequestStartEvent(request !== null && request !== void 0 ? request : this.request);
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
         * @param request - Custom requests with this event should be cloned.
         * @returns Client request processing success event.
         */
        clone(request) {
            return new RequestSuccessEvent(request !== null && request !== void 0 ? request : this.request, request ? request.asFetchRequest : this.fetchRequest, this.response);
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
         * @param request - Custom requests with this event should be cloned.
         * @returns Client request processing failure event.
         */
        clone(request) {
            return new RequestErrorEvent(request !== null && request !== void 0 ? request : this.request, request ? request.asFetchRequest : this.fetchRequest, this.error);
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
         * @param request - Custom requests with this event should be cloned.
         * @returns Client request cancel event.
         */
        clone(request) {
            return new RequestCancelEvent(request !== null && request !== void 0 ? request : this.request);
        }
    }

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
     * Base shared worker request implementation.
     *
     * In the `SharedWorker` context, this base class is used both for `client`-provided (they won't be used for actual
     * request) and those that are created by `SharedWorker` code (`service` request, which will be used in actual
     * requests).
     *
     * **Note:** The term `service` request in inline documentation will mean request created by `SharedWorker` and used to
     * call PubNub REST API.
     */
    class BasePubNubRequest extends EventTarget {
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
         * @param userId - Unique user identifier from the name of which request will be made.
         * @param channels - List of channels used in request.
         * @param channelGroups - List of channel groups used in request.
         * @param [accessToken] - Access token with permissions to access provided `channels` and `channelGroups` on behalf of
         * `userId`.
         */
        constructor(request, subscribeKey, userId, channels, channelGroups, accessToken) {
            super();
            this.request = request;
            this.subscribeKey = subscribeKey;
            this.channels = channels;
            this.channelGroups = channelGroups;
            /**
             * Map of attached to the service request `client`-provided requests by their request identifiers.
             *
             * **Context:** `service`-provided requests only.
             */
            this.dependents = {};
            /**
             * Whether the request already received a service response or an error.
             *
             * **Important:** Any interaction with completed requests except requesting properties is prohibited.
             */
            this._completed = false;
            /**
             * Whether request has been cancelled or not.
             *
             * **Important:** Any interaction with canceled requests except requesting properties is prohibited.
             */
            this._canceled = false;
            /**
             * Stringify request query key/value pairs.
             *
             * @param query - Request query object.
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
        // endregion
        // --------------------------------------------------------
        // ---------------------- Properties ----------------------
        // --------------------------------------------------------
        // region Properties
        /**
         * Get the request's unique identifier.
         *
         * @returns Request's unique identifier.
         */
        get identifier() {
            return this.request.identifier;
        }
        /**
         * Retrieve the origin that is used to access PubNub REST API.
         *
         * @returns Origin, which is used to access PubNub REST API.
         */
        get origin() {
            return this.request.origin;
        }
        /**
         * Retrieve the unique user identifier from the name of which request will be made.
         *
         * @returns Unique user identifier from the name of which request will be made.
         */
        get userId() {
            return this._userId;
        }
        /**
         * Update the unique user identifier from the name of which request will be made.
         *
         * @param value - New unique user identifier.
         */
        set userId(value) {
            this._userId = value;
            // Patch underlying transport request query parameters to use new value.
            this.request.queryParameters.uuid = value;
        }
        /**
         * Retrieve access token with permissions to access provided `channels` and `channelGroups`.
         *
         * @returns Access token with permissions for {@link userId} or `undefined` if not set.
         */
        get accessToken() {
            return this._accessToken;
        }
        /**
         * Update the access token which should be used to access provided `channels` and `channelGroups` by the user with
         * {@link userId}.
         *
         * @param [value] - Access token with permissions for {@link userId}.
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
         * Retrieve {@link PubNubClient|PubNub} client associates with request.
         *
         * **Context:** `client`-provided requests only.
         *
         * @returns Reference to the {@link PubNubClient|PubNub} client that is sending the request.
         */
        get client() {
            return this._client;
        }
        /**
         * Associate request with PubNub client.
         *
         * **Context:** `client`-provided requests only.
         *
         * @param value - {@link PubNubClient|PubNub} client that created request in `SharedWorker` context.
         */
        set client(value) {
            this._client = value;
        }
        /**
         * Retrieve whether the request already received a service response or an error.
         *
         * @returns `true` if request already completed processing (not with {@link cancel}).
         */
        get completed() {
            return this._completed;
        }
        /**
         * Retrieve whether the request can be cancelled or not.
         *
         * @returns `true` if there is a possibility and meaning to be able to cancel the request.
         */
        get cancellable() {
            return this.request.cancellable;
        }
        /**
         * Retrieve whether the request has been canceled prior to completion or not.
         *
         * @returns `true` if the request didn't complete processing.
         */
        get canceled() {
            return this._canceled;
        }
        /**
         * Update controller, which is used to cancel ongoing `service`-provided requests by signaling {@link fetch}.
         *
         * **Context:** `service`-provided requests only.
         *
         * @param value - Controller that has been used to signal {@link fetch} for request cancellation.
         */
        set fetchAbortController(value) {
            // There is no point in completed request `fetch` abort controller set.
            if (this.completed || this.canceled)
                return;
            // Fetch abort controller can't be set for `client`-provided requests.
            if (!this.isServiceRequest) {
                console.error('Unexpected attempt to set fetch abort controller on client-provided request.');
                return;
            }
            if (this._fetchAbortController) {
                console.error('Only one abort controller can be set for service-provided requests.');
                return;
            }
            this._fetchAbortController = value;
        }
        /**
         * Retrieve `service`-provided fetch request abort controller.
         *
         * **Context:** `service`-provided requests only.
         *
         * @returns `service`-provided fetch request abort controller.
         */
        get fetchAbortController() {
            return this._fetchAbortController;
        }
        /**
         * Represent transport request as {@link fetch} {@link Request}.
         *
         * @returns Ready-to-use {@link Request} instance.
         */
        get asFetchRequest() {
            const queryParameters = this.request.queryParameters;
            const headers = {};
            let query = '';
            if (this.request.headers)
                for (const [key, value] of Object.entries(this.request.headers))
                    headers[key] = value;
            if (queryParameters && Object.keys(queryParameters).length !== 0)
                query = `?${this.queryStringFromObject(queryParameters)}`;
            return new Request(`${this.origin}${this.request.path}${query}`, {
                method: this.request.method,
                headers: Object.keys(headers).length ? headers : undefined,
                redirect: 'follow',
            });
        }
        /**
         * Retrieve the service (aggregated/modified) request, which will actually be used to call the REST API endpoint.
         *
         * **Context:** `client`-provided requests only.
         *
         * @returns Service (aggregated/modified) request, which will actually be used to call the REST API endpoint.
         */
        get serviceRequest() {
            return this._serviceRequest;
        }
        /**
         * Link request processing results to the service (aggregated/modified) request.
         *
         * **Context:** `client`-provided requests only.
         *
         * @param value - Service (aggregated/modified) request for which process progress should be observed.
         */
        set serviceRequest(value) {
            // This function shouldn't be called even unintentionally, on the `service`-provided requests.
            if (this.isServiceRequest) {
                console.error('Unexpected attempt to set service-provided request on service-provided request.');
                return;
            }
            const previousServiceRequest = this.serviceRequest;
            this._serviceRequest = value;
            // Detach from the previous service request if it has been changed (to a new one or unset).
            if (previousServiceRequest && (!value || previousServiceRequest.identifier !== value.identifier))
                previousServiceRequest.detachRequest(this);
            // There is no need to set attach to service request if either of them is already completed, or canceled.
            if (this.completed || this.canceled || (value && (value.completed || value.canceled))) {
                this._serviceRequest = undefined;
                return;
            }
            if (previousServiceRequest && value && previousServiceRequest.identifier === value.identifier)
                return;
            // Attach the request to the service request processing results.
            if (value)
                value.attachRequest(this);
        }
        /**
         * Retrieve whether the receiver is a `service`-provided request or not.
         *
         * @returns `true` if the request has been created by the `SharedWorker`.
         */
        get isServiceRequest() {
            return !this.client;
        }
        // endregion
        // --------------------------------------------------------
        // ---------------------- Dependency ----------------------
        // --------------------------------------------------------
        // region Dependency
        /**
         * Retrieve a list of `client`-provided requests that have been attached to the `service`-provided request.
         *
         * **Context:** `service`-provided requests only.
         *
         * @returns List of attached `client`-provided requests.
         */
        dependentRequests() {
            // Return an empty list for `client`-provided requests.
            if (!this.isServiceRequest)
                return [];
            return Object.values(this.dependents);
        }
        /**
         * Attach the `client`-provided request to the receiver (`service`-provided request) to receive a response from the
         * PubNub REST API.
         *
         * **Context:** `service`-provided requests only.
         *
         * @param request - `client`-provided request that should be attached to the receiver (`service`-provided request).
         */
        attachRequest(request) {
            // Request attachments works only on service requests.
            if (!this.isServiceRequest || this.dependents[request.identifier]) {
                if (!this.isServiceRequest)
                    console.error('Unexpected attempt to attach requests using client-provided request.');
                return;
            }
            this.dependents[request.identifier] = request;
            this.addEventListenersForRequest(request);
        }
        /**
         * Detach the `client`-provided request from the receiver (`service`-provided request) to ignore any response from the
         * PubNub REST API.
         *
         * **Context:** `service`-provided requests only.
         *
         * @param request - `client`-provided request that should be attached to the receiver (`service`-provided request).
         */
        detachRequest(request) {
            // Request detachments works only on service requests.
            if (!this.isServiceRequest || !this.dependents[request.identifier]) {
                if (!this.isServiceRequest)
                    console.error('Unexpected attempt to detach requests using client-provided request.');
                return;
            }
            delete this.dependents[request.identifier];
            request.removeEventListenersFromRequest();
            // Because `service`-provided requests are created in response to the `client`-provided one we need to cancel the
            // receiver if there are no more attached `client`-provided requests.
            // This ensures that there will be no abandoned/dangling `service`-provided request in `SharedWorker` structures.
            if (Object.keys(this.dependents).length === 0)
                this.cancel('Cancel request');
        }
        // endregion
        // --------------------------------------------------------
        // ------------------ Request processing ------------------
        // --------------------------------------------------------
        // region Request processing
        /**
         * Notify listeners that ongoing request processing has been cancelled.
         *
         * **Note:** The current implementation doesn't let {@link PubNubClient|PubNub} directly call
         * {@link cancel}, and it can be called from `SharedWorker` code logic.
         *
         * **Important:** Previously attached `client`-provided requests should be re-attached to another `service`-provided
         * request or properly cancelled with {@link PubNubClient|PubNub} notification of the core PubNub client module.
         *
         * @param [reason] - Reason because of which the request has been cancelled. The request manager uses this to specify
         * whether the `service`-provided request has been cancelled on-demand or because of timeout.
         * @param [notifyDependent] - Whether dependent requests should receive cancellation error or not.
         * @returns List of detached `client`-provided requests.
         */
        cancel(reason, notifyDependent = false) {
            // There is no point in completed request cancellation.
            if (this.completed || this.canceled) {
                return [];
            }
            const dependentRequests = this.dependentRequests();
            if (this.isServiceRequest) {
                // Detach request if not interested in receiving request cancellation error (because of timeout).
                // When switching between aggregated `service`-provided requests there is no need in handling cancellation of
                // outdated request.
                if (!notifyDependent)
                    dependentRequests.forEach((request) => (request.serviceRequest = undefined));
                if (this._fetchAbortController) {
                    this._fetchAbortController.abort(reason);
                    this._fetchAbortController = undefined;
                }
            }
            else
                this.serviceRequest = undefined;
            this._canceled = true;
            this.stopRequestTimeoutTimer();
            this.dispatchEvent(new RequestCancelEvent(this));
            return dependentRequests;
        }
        /**
         * Create and return running request processing timeout timer.
         *
         * @returns Promise with timout timer resolution.
         */
        requestTimeoutTimer() {
            return new Promise((_, reject) => {
                this._fetchTimeoutTimer = setTimeout(() => {
                    reject(new Error('Request timeout'));
                    this.cancel('Cancel because of timeout', true);
                }, this.request.timeout * 1000);
            });
        }
        /**
         * Stop request processing timeout timer without error.
         */
        stopRequestTimeoutTimer() {
            if (!this._fetchTimeoutTimer)
                return;
            clearTimeout(this._fetchTimeoutTimer);
            this._fetchTimeoutTimer = undefined;
        }
        /**
         * Handle request processing started by the request manager (actual sending).
         */
        handleProcessingStarted() {
            // Log out request processing start (will be made only for client-provided request).
            this.logRequestStart(this);
            this.dispatchEvent(new RequestStartEvent(this));
        }
        /**
         * Handle request processing successfully completed by request manager (actual sending).
         *
         * @param fetchRequest - Reference to the actual request that has been used with {@link fetch}.
         * @param response - PubNub service response which is ready to be sent to the core PubNub client module.
         */
        handleProcessingSuccess(fetchRequest, response) {
            this.addRequestInformationForResult(this, fetchRequest, response);
            this.logRequestSuccess(this, response);
            this._completed = true;
            this.stopRequestTimeoutTimer();
            this.dispatchEvent(new RequestSuccessEvent(this, fetchRequest, response));
        }
        /**
         * Handle request processing failed by request manager (actual sending).
         *
         * @param fetchRequest - Reference to the actual request that has been used with {@link fetch}.
         * @param error - Request processing error description.
         */
        handleProcessingError(fetchRequest, error) {
            this.addRequestInformationForResult(this, fetchRequest, error);
            this.logRequestError(this, error);
            this._completed = true;
            this.stopRequestTimeoutTimer();
            this.dispatchEvent(new RequestErrorEvent(this, fetchRequest, error));
        }
        // endregion
        // --------------------------------------------------------
        // ------------------- Event Handlers ---------------------
        // --------------------------------------------------------
        // region Event handlers
        /**
         * Add `service`-provided request processing progress listeners for `client`-provided requests.
         *
         * **Context:** `service`-provided requests only.
         *
         * @param request - `client`-provided request that would like to observe `service`-provided request progress.
         */
        addEventListenersForRequest(request) {
            if (!this.isServiceRequest) {
                console.error('Unexpected attempt to add listeners using a client-provided request.');
                return;
            }
            request.abortController = new AbortController();
            this.addEventListener(PubNubSharedWorkerRequestEvents.Started, (event) => {
                if (!(event instanceof RequestStartEvent))
                    return;
                request.logRequestStart(event.request);
                request.dispatchEvent(event.clone(request));
            }, { signal: request.abortController.signal, once: true });
            this.addEventListener(PubNubSharedWorkerRequestEvents.Success, (event) => {
                if (!(event instanceof RequestSuccessEvent))
                    return;
                request.removeEventListenersFromRequest();
                request.addRequestInformationForResult(event.request, event.fetchRequest, event.response);
                request.logRequestSuccess(event.request, event.response);
                request._completed = true;
                request.dispatchEvent(event.clone(request));
            }, { signal: request.abortController.signal, once: true });
            this.addEventListener(PubNubSharedWorkerRequestEvents.Error, (event) => {
                if (!(event instanceof RequestErrorEvent))
                    return;
                request.removeEventListenersFromRequest();
                request.addRequestInformationForResult(event.request, event.fetchRequest, event.error);
                request.logRequestError(event.request, event.error);
                request._completed = true;
                request.dispatchEvent(event.clone(request));
            }, { signal: request.abortController.signal, once: true });
        }
        /**
         * Remove listeners added to the `service` request.
         *
         * **Context:** `client`-provided requests only.
         */
        removeEventListenersFromRequest() {
            // Only client-provided requests add listeners.
            if (this.isServiceRequest || !this.abortController) {
                if (this.isServiceRequest)
                    console.error('Unexpected attempt to remove listeners using a client-provided request.');
                return;
            }
            this.abortController.abort();
            this.abortController = undefined;
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Check whether the request contains specified channels in the URI path and channel groups in the request query or
         * not.
         *
         * @param channels - List of channels for which any entry should be checked in the request.
         * @param channelGroups - List of channel groups for which any entry should be checked in the request.
         * @returns `true` if receiver has at least one entry from provided `channels` or `channelGroups` in own URI.
         */
        hasAnyChannelsOrGroups(channels, channelGroups) {
            return (this.channels.some((channel) => channels.includes(channel)) ||
                this.channelGroups.some((channelGroup) => channelGroups.includes(channelGroup)));
        }
        /**
         * Append request-specific information to the processing result.
         *
         * @param fetchRequest - Reference to the actual request that has been used with {@link fetch}.
         * @param request - Reference to the client- or service-provided request with information for response.
         * @param result - Request processing result that should be modified.
         */
        addRequestInformationForResult(request, fetchRequest, result) {
            if (this.isServiceRequest)
                return;
            result.clientIdentifier = this.client.identifier;
            result.identifier = this.identifier;
            result.url = fetchRequest.url;
        }
        /**
         * Log to the core PubNub client module information about request processing start.
         *
         * @param request - Reference to the client- or service-provided request information about which should be logged.
         */
        logRequestStart(request) {
            if (this.isServiceRequest)
                return;
            this.client.logger.debug(() => ({ messageType: 'network-request', message: request.request }));
        }
        /**
         * Log to the core PubNub client module information about request processing successful completion.
         *
         * @param request - Reference to the client- or service-provided request information about which should be logged.
         * @param response - Reference to the PubNub service response.
         */
        logRequestSuccess(request, response) {
            if (this.isServiceRequest)
                return;
            this.client.logger.debug(() => {
                const { status, headers, body } = response.response;
                const fetchRequest = request.asFetchRequest;
                // Copy Headers object content into plain Record.
                Object.entries(headers).forEach(([key, value]) => (value));
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
            if (this.isServiceRequest)
                return;
            if ((error.error ? error.error.message : 'Unknown').toLowerCase().includes('timeout')) {
                this.client.logger.debug(() => ({
                    messageType: 'network-request',
                    message: request.request,
                    details: 'Timeout',
                    canceled: true,
                }));
            }
            else {
                this.client.logger.warn(() => {
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
         * Retrieve error details from the error response object.
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
         * @returns Percent-encoded string.
         */
        encodeString(input) {
            return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
        }
    }

    class SubscribeRequest extends BasePubNubRequest {
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
         * {@link SubscribeRequest.channels|channels} and {@link SubscribeRequest.channelGroups|channelGroups}.
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
            return new SubscribeRequest(request, subscriptionKey, accessToken, cachedChannelGroups, cachedChannels, cachedState);
        }
        /**
         * Create aggregated subscribe request.
         *
         * @param requests - List of subscribe requests for same the user.
         * @param [accessToken] - Access token with permissions to announce presence on
         * {@link SubscribeRequest.channels|channels} and {@link SubscribeRequest.channelGroups|channelGroups}.
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
         * @param [accessToken] - Access token with read permissions on {@link SubscribeRequest.channels|channels} and
         * {@link SubscribeRequest.channelGroups|channelGroups}.
         * @param [cachedChannels] - Previously cached list of channels for subscription.
         * @param [cachedChannelGroups] - Previously cached list of channel groups for subscription.
         * @param [cachedState] - Previously cached user's presence state for channels and groups.
         */
        constructor(request, subscriptionKey, accessToken, cachedChannelGroups, cachedChannels, cachedState) {
            var _a;
            // Retrieve information about request's origin (who initiated it).
            const requireCachedStateReset = !!request.queryParameters && 'on-demand' in request.queryParameters;
            delete request.queryParameters['on-demand'];
            super(request, subscriptionKey, request.queryParameters.uuid, cachedChannels !== null && cachedChannels !== void 0 ? cachedChannels : SubscribeRequest.channelsFromRequest(request), cachedChannelGroups !== null && cachedChannelGroups !== void 0 ? cachedChannelGroups : SubscribeRequest.channelGroupsFromRequest(request), accessToken);
            /**
             * Request creation timestamp.
             */
            this._creationDate = Date.now();
            /**
             * Timetoken region which should be used to patch timetoken origin in initial response.
             */
            this.timetokenRegionOverride = '0';
            // Shift on millisecond creation timestamp for two sequential requests.
            if (this._creationDate <= SubscribeRequest.lastCreationDate) {
                SubscribeRequest.lastCreationDate++;
                this._creationDate = SubscribeRequest.lastCreationDate;
            }
            else
                SubscribeRequest.lastCreationDate = this._creationDate;
            this._requireCachedStateReset = requireCachedStateReset;
            if (request.queryParameters['filter-expr'])
                this.filterExpression = request.queryParameters['filter-expr'];
            this._timetoken = ((_a = request.queryParameters.tt) !== null && _a !== void 0 ? _a : '0');
            if (request.queryParameters.tr)
                this._region = request.queryParameters.tr;
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
         * Retrieve `subscribe` request creation timestamp.
         *
         * @returns `Subscribe` request creation timestamp.
         */
        get creationDate() {
            return this._creationDate;
        }
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
            return this._timetoken === '0';
        }
        /**
         * Retrieve subscription loop timetoken.
         *
         * @returns Subscription loop timetoken.
         */
        get timetoken() {
            return this._timetoken;
        }
        /**
         * Update subscription loop timetoken.
         *
         * @param value - New timetoken that should be used in PubNub REST API calls.
         */
        set timetoken(value) {
            this._timetoken = value;
            // Update value for transport request object.
            this.request.queryParameters.tt = value;
        }
        /**
         * Retrieve subscription loop timetoken's region.
         *
         * @returns Subscription loop timetoken's region.
         */
        get region() {
            return this._region;
        }
        /**
         * Update subscription loop timetoken's region.
         *
         * @param value - New timetoken's region that should be used in PubNub REST API calls.
         */
        set region(value) {
            this._region = value;
            // Update value for transport request object.
            if (value)
                this.request.queryParameters.tr = value;
            else
                delete this.request.queryParameters.tr;
        }
        /**
         * Retrieve whether the request requires the client's cached subscription state reset or not.
         *
         * @returns `true` if a subscribe request has been created on user request (`subscribe()` call) or not.
         */
        get requireCachedStateReset() {
            return this._requireCachedStateReset;
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
            return !!request.queryParameters && !('on-demand' in request.queryParameters);
        }
        /**
         * Reset the inner state of the `subscribe` request object to the one that `initial` requests.
         */
        resetToInitialRequest() {
            this._requireCachedStateReset = true;
            this._timetoken = '0';
            this._region = undefined;
            delete this.request.queryParameters.tt;
        }
        /**
         * Check whether received is a subset of another `subscribe` request.
         *
         * If the receiver is a subset of another means:
         * - list of channels of another `subscribe` request includes all channels from the receiver,
         * - list of channel groups of another `subscribe` request includes all channel groups from the receiver,
         * - receiver's timetoken equal to `0` or another request `timetoken`.
         *
         * @param request - Request that should be checked to be a superset of received.
         * @retuns `true` in case if the receiver is a subset of another `subscribe` request.
         */
        isSubsetOf(request) {
            if (request.channelGroups.length && !this.includesStrings(request.channelGroups, this.channelGroups))
                return false;
            if (request.channels.length && !this.includesStrings(request.channels, this.channels))
                return false;
            return this.timetoken === '0' || this.timetoken === request.timetoken || request.timetoken === '0';
        }
        /**
         * Serialize request for easier representation in logs.
         *
         * @returns Stringified `subscribe` request.
         */
        toString() {
            return `SubscribeRequest { clientIdentifier: ${this.client ? this.client.identifier : 'service request'}, requestIdentifier: ${this.identifier}, serviceRequestIdentified: ${this.client ? (this.serviceRequest ? this.serviceRequest.identifier : "'not set'") : "'is service request"}, channels: [${this.channels.length ? this.channels.map((channel) => `'${channel}'`).join(', ') : ''}], channelGroups: [${this.channelGroups.length ? this.channelGroups.map((group) => `'${group}'`).join(', ') : ''}], timetoken: ${this.timetoken}, region: ${this.region}, reset: ${this._requireCachedStateReset ? "'reset'" : "'do not reset'"} }`;
        }
        /**
         * Serialize request to "typed" JSON string.
         *
         * @returns "Typed" JSON string.
         */
        toJSON() {
            return this.toString();
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
    // --------------------------------------------------------
    // ---------------------- Information ---------------------
    // --------------------------------------------------------
    // region Information
    /**
     * Global subscription request creation date tracking.
     *
     * Tracking is required to handle about rapid requests receive and need to know which of them were earlier.
     */
    SubscribeRequest.lastCreationDate = 0;

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

    class LeaveRequest extends BasePubNubRequest {
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
            super(request, subscriptionKey, request.queryParameters.uuid, channels, channelGroups, accessToken);
            this.allChannelGroups = allChannelGroups;
            this.allChannels = allChannels;
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Serialize request for easier representation in logs.
         *
         * @returns Stringified `leave` request.
         */
        toString() {
            return `LeaveRequest { channels: [${this.channels.length ? this.channels.map((channel) => `'${channel}'`).join(', ') : ''}], channelGroups: [${this.channelGroups.length ? this.channelGroups.map((group) => `'${group}'`).join(', ') : ''}] }`;
        }
        /**
         * Serialize request to "typed" JSON string.
         *
         * @returns "Typed" JSON string.
         */
        toJSON() {
            return this.toString();
        }
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
     * Create service `leave` request for a specific PubNub client with channels and groups for removal.
     *
     * @param client - Reference to the PubNub client whose credentials should be used for new request.
     * @param channels - List of channels that are not used by any other clients and can be left.
     * @param channelGroups - List of channel groups that are not used by any other clients and can be left.
     * @returns Service `leave` request.
     */
    const leaveRequest = (client, channels, channelGroups) => {
        channels = channels
            .filter((channel) => !channel.endsWith('-pnpres'))
            .map((channel) => encodeString(channel))
            .sort();
        channelGroups = channelGroups
            .filter((channelGroup) => !channelGroup.endsWith('-pnpres'))
            .map((channelGroup) => encodeString(channelGroup))
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
    };
    /**
     * Percent-encode input string.
     *
     * **Note:** Encode content in accordance of the `PubNub` service requirements.
     *
     * @param input - Source string or number for encoding.
     * @returns Percent-encoded string.
     */
    const encodeString = (input) => {
        return encodeURIComponent(input).replace(/[!~*'()]/g, (x) => `%${x.charCodeAt(0).toString(16).toUpperCase()}`);
    };

    class SubscriptionStateChange {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructor ----------------------
        // --------------------------------------------------------
        // region Constructor
        /**
         * Squash changes to exclude repetitive removal and addition of the same requests in a single change transaction.
         *
         * @param changes - List of changes that should be analyzed and squashed if possible.
         * @returns List of changes that doesn't have self-excluding change requests.
         */
        static squashedChanges(changes) {
            if (!changes.length || changes.length === 1)
                return changes;
            // Sort changes in order in which they have been created (original `changes` is Set).
            const sortedChanges = changes.sort((lhc, rhc) => lhc.timestamp - rhc.timestamp);
            // Remove changes which first add and then remove same request (removes both addition and removal change entry).
            const requestAddChange = sortedChanges.filter((change) => !change.remove);
            requestAddChange.forEach((addChange) => {
                for (let idx = 0; idx < requestAddChange.length; idx++) {
                    const change = requestAddChange[idx];
                    if (!change.remove || change.request.identifier !== addChange.request.identifier)
                        continue;
                    sortedChanges.splice(idx, 1);
                    sortedChanges.splice(sortedChanges.indexOf(addChange), 1);
                    break;
                }
            });
            // Filter out old `add` change entries for the same client.
            const addChangePerClient = {};
            requestAddChange.forEach((change) => {
                if (addChangePerClient[change.clientIdentifier]) {
                    const changeIdx = sortedChanges.indexOf(change);
                    if (changeIdx >= 0)
                        sortedChanges.splice(changeIdx, 1);
                }
                addChangePerClient[change.clientIdentifier] = change;
            });
            return sortedChanges;
        }
        /**
         * Create subscription state batched change entry.
         *
         * @param clientIdentifier - Identifier of the {@link PubNubClient|PubNub} client that provided data for subscription
         * state change.
         * @param request - Request that should be used during batched subscription state modification.
         * @param remove - Whether provided {@link request} should be removed from `subscription` state or not.
         * @param sendLeave - Whether the {@link PubNubClient|client} should send a presence `leave` request for _free_
         * channels and groups or not.
         * @param [clientInvalidate=false] - Whether the `subscription` state change was caused by the
         * {@link PubNubClient|PubNub} client invalidation (unregister) or not.
         */
        constructor(clientIdentifier, request, remove, sendLeave, clientInvalidate = false) {
            this.clientIdentifier = clientIdentifier;
            this.request = request;
            this.remove = remove;
            this.sendLeave = sendLeave;
            this.clientInvalidate = clientInvalidate;
            this._timestamp = this.timestampForChange();
        }
        // endregion
        // --------------------------------------------------------
        // --------------------- Properties -----------------------
        // --------------------------------------------------------
        // region Properties
        /**
         * Retrieve subscription change enqueue timestamp.
         *
         * @returns Subscription change enqueue timestamp.
         */
        get timestamp() {
            return this._timestamp;
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Serialize object for easier representation in logs.
         *
         * @returns Stringified `subscription` state object.
         */
        toString() {
            return `SubscriptionStateChange { timestamp: ${this.timestamp}, client: ${this.clientIdentifier}, request: ${this.request.toString()}, remove: ${this.remove ? "'remove'" : "'do not remove'"}, sendLeave: ${this.sendLeave ? "'send'" : "'do not send'"} }`;
        }
        /**
         * Serialize the object to a "typed" JSON string.
         *
         * @returns "Typed" JSON string.
         */
        toJSON() {
            return this.toString();
        }
        /**
         * Retrieve timestamp when change has been added to the batch.
         *
         * Non-repetitive timestamp required for proper changes sorting and identification of requests which has been removed
         * and added during single batch.
         *
         * @returns Non-repetitive timestamp even for burst changes.
         */
        timestampForChange() {
            const timestamp = Date.now();
            if (timestamp <= SubscriptionStateChange.previousChangeTimestamp) {
                SubscriptionStateChange.previousChangeTimestamp++;
            }
            else
                SubscriptionStateChange.previousChangeTimestamp = timestamp;
            return SubscriptionStateChange.previousChangeTimestamp;
        }
    }
    // --------------------------------------------------------
    // ---------------------- Information ---------------------
    // --------------------------------------------------------
    // region Information
    /**
     * Timestamp when batched changes has been modified before.
     */
    SubscriptionStateChange.previousChangeTimestamp = 0;
    /**
     * Aggregated subscription state.
     *
     * State object responsible for keeping in sync and optimization of `client`-provided {@link SubscribeRequest|requests}
     * by attaching them to already existing or new aggregated `service`-provided {@link SubscribeRequest|requests} to
     * reduce number of concurrent connections.
     */
    class SubscriptionState extends EventTarget {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructor ----------------------
        // --------------------------------------------------------
        // region Constructor
        /**
         * Create subscription state management object.
         *
         * @param identifier -  Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
         */
        constructor(identifier) {
            super();
            this.identifier = identifier;
            // --------------------------------------------------------
            // ---------------------- Information ---------------------
            // --------------------------------------------------------
            // region Information
            /**
             * Map of `client`-provided request identifiers to the subscription state listener abort controller.
             */
            this.requestListenersAbort = {};
            /**
             * Map of {@link PubNubClient|client} identifiers to their portion of data which affects subscription state.
             *
             * **Note:** This information is removed only with the {@link SubscriptionState.removeClient|removeClient} function
             * call.
             */
            this.clientsState = {};
            /**
             * Map of {@link PubNubClient|client} to its {@link SubscribeRequest|request} that already received response/error
             * or has been canceled.
             */
            this.lastCompletedRequest = {};
            /**
             * List of identifiers of the {@link PubNubClient|PubNub} clients that should be invalidated when it will be
             * possible.
             */
            this.clientsForInvalidation = [];
            /**
             * Map of {@link PubNubClient|client} to its {@link SubscribeRequest|request} which is pending for
             * `service`-provided {@link SubscribeRequest|request} processing results.
             */
            this.requests = {};
            /**
             * Aggregated/modified {@link SubscribeRequest|subscribe} requests which is used to call PubNub REST API.
             *
             * **Note:** There could be multiple requests to handle the situation when similar {@link PubNubClient|PubNub} clients
             * have subscriptions but with different timetokens (if requests have intersecting lists of channels and groups they
             * can be merged in the future if a response on a similar channel will be received and the same `timetoken` will be
             * used for continuation).
             */
            this.serviceRequests = [];
            /**
             * Cached list of channel groups used with recent aggregation service requests.
             *
             * **Note:** Set required to have the ability to identify which channel groups have been added/removed with recent
             * {@link SubscriptionStateChange|changes} list processing.
             */
            this.channelGroups = new Set();
            /**
             * Cached list of channels used with recent aggregation service requests.
             *
             * **Note:** Set required to have the ability to identify which channels have been added/removed with recent
             * {@link SubscriptionStateChange|changes} list processing.
             */
            this.channels = new Set();
        }
        // endregion
        // --------------------------------------------------------
        // ---------------------- Accessors -----------------------
        // --------------------------------------------------------
        // region Accessors
        /**
         * Check whether subscription state contain state for specific {@link PubNubClient|PubNub} client.
         *
         * @param client - Reference to the {@link PubNubClient|PubNub} client for which state should be checked.
         * @returns `true` if there is state related to the {@link PubNubClient|client}.
         */
        hasStateForClient(client) {
            return !!this.clientsState[client.identifier];
        }
        /**
         * Retrieve portion of subscription state which is unique for the {@link PubNubClient|client}.
         *
         * Function will return list of channels and groups which has been introduced by the client into the state (no other
         * clients have them).
         *
         * @param client - Reference to the {@link PubNubClient|PubNub} client for which unique elements should be retrieved
         * from the state.
         * @param channels - List of client's channels from subscription state.
         * @param channelGroups - List of client's channel groups from subscription state.
         * @returns State with channels and channel groups unique for the {@link PubNubClient|client}.
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
         * Retrieve ongoing `client`-provided {@link SubscribeRequest|subscribe} request for the {@link PubNubClient|client}.
         *
         * @param client - Reference to the {@link PubNubClient|PubNub} client for which requests should be retrieved.
         * @param [invalidated=false] - Whether receiving request for invalidated (unregistered) {@link PubNubClient|PubNub}
         * client.
         * @returns A `client`-provided {@link SubscribeRequest|subscribe} request if it has been sent by
         * {@link PubNubClient|client}.
         */
        requestForClient(client, invalidated = false) {
            var _a;
            return (_a = this.requests[client.identifier]) !== null && _a !== void 0 ? _a : (invalidated ? this.lastCompletedRequest[client.identifier] : undefined);
        }
        // endregion
        // --------------------------------------------------------
        // --------------------- Aggregation ----------------------
        // --------------------------------------------------------
        // region Aggregation
        /**
         * Mark specific client as suitable for state invalidation when it will be appropriate.
         *
         * @param client - Reference to the {@link PubNubClient|PubNub} client which should be invalidated when will be
         * possible.
         */
        invalidateClient(client) {
            if (this.clientsForInvalidation.includes(client.identifier))
                return;
            this.clientsForInvalidation.push(client.identifier);
        }
        /**
         * Process batched subscription state change.
         *
         * @param changes - List of {@link SubscriptionStateChange|changes} made from requests received from the core
         * {@link PubNubClient|PubNub} client modules.
         */
        processChanges(changes) {
            if (changes.length)
                changes = SubscriptionStateChange.squashedChanges(changes);
            if (!changes.length)
                return;
            let stateRefreshRequired = this.channelGroups.size === 0 && this.channels.size === 0;
            if (!stateRefreshRequired)
                stateRefreshRequired = changes.some((change) => change.remove || change.request.requireCachedStateReset);
            // Update list of PubNub client requests.
            const appliedRequests = this.applyChanges(changes);
            let stateChanges;
            if (stateRefreshRequired)
                stateChanges = this.refreshInternalState();
            // Identify and dispatch subscription state change event with service requests for cancellation and start.
            this.handleSubscriptionStateChange(changes, stateChanges, appliedRequests.initial, appliedRequests.continuation, appliedRequests.removed);
            // Check whether subscription state for all registered clients has been removed or not.
            if (!Object.keys(this.clientsState).length)
                this.dispatchEvent(new SubscriptionStateInvalidateEvent());
        }
        /**
         * Make changes to the internal state.
         *
         * Categorize changes by grouping requests (into `initial`, `continuation`, and `removed` groups) and update internal
         * state to reflect those changes (add/remove `client`-provided requests).
         *
         * @param changes - Final subscription state changes list.
         * @returns Subscribe request separated by different subscription loop stages.
         */
        applyChanges(changes) {
            const continuationRequests = [];
            const initialRequests = [];
            const removedRequests = [];
            changes.forEach((change) => {
                const { remove, request, clientIdentifier, clientInvalidate } = change;
                if (!remove) {
                    if (request.isInitialSubscribe)
                        initialRequests.push(request);
                    else
                        continuationRequests.push(request);
                    this.requests[clientIdentifier] = request;
                    this.addListenersForRequestEvents(request);
                }
                if (remove && (!!this.requests[clientIdentifier] || !!this.lastCompletedRequest[clientIdentifier])) {
                    if (clientInvalidate) {
                        delete this.lastCompletedRequest[clientIdentifier];
                        delete this.clientsState[clientIdentifier];
                    }
                    delete this.requests[clientIdentifier];
                    removedRequests.push(request);
                }
            });
            return { initial: initialRequests, continuation: continuationRequests, removed: removedRequests };
        }
        /**
         * Process changes in subscription state.
         *
         * @param changes - Final subscription state changes list.
         * @param stateChanges - Changes to the subscribed channels and groups in aggregated requests.
         * @param initialRequests - List of `client`-provided handshake {@link SubscribeRequest|subscribe} requests.
         * @param continuationRequests - List of `client`-provided subscription loop continuation
         * {@link SubscribeRequest|subscribe} requests.
         * @param removedRequests - List of `client`-provided {@link SubscribeRequest|subscribe} requests that should be
         * removed from the state.
         */
        handleSubscriptionStateChange(changes, stateChanges, initialRequests, continuationRequests, removedRequests) {
            var _a, _b, _c, _d;
            // Retrieve list of active (not completed or canceled) `service`-provided requests.
            const serviceRequests = this.serviceRequests.filter((request) => !request.completed && !request.canceled);
            const requestsWithInitialResponse = [];
            const newContinuationServiceRequests = [];
            const newInitialServiceRequests = [];
            const cancelledServiceRequests = [];
            let serviceLeaveRequest;
            [...continuationRequests];
            [...initialRequests];
            // Identify token override for initial requests.
            let timetokenOverrideRefreshTimestamp;
            let decidedTimetokenRegionOverride;
            let decidedTimetokenOverride;
            const cancelServiceRequest = (serviceRequest) => {
                cancelledServiceRequests.push(serviceRequest);
                const rest = serviceRequest
                    .dependentRequests()
                    .filter((dependantRequest) => !removedRequests.includes(dependantRequest));
                if (rest.length === 0)
                    return;
                rest.forEach((dependantRequest) => (dependantRequest.serviceRequest = undefined));
                (serviceRequest.isInitialSubscribe ? initialRequests : continuationRequests).push(...rest);
            };
            // --------------------------------------------------
            // Identify ongoing `service`-provided requests which should be canceled because channels/channel groups has been
            // added/removed.
            //
            if (stateChanges) {
                if (stateChanges.channels.added || stateChanges.channelGroups.added) {
                    for (const serviceRequest of serviceRequests)
                        cancelServiceRequest(serviceRequest);
                    serviceRequests.length = 0;
                }
                else if (stateChanges.channels.removed || stateChanges.channelGroups.removed) {
                    const channelGroups = (_a = stateChanges.channelGroups.removed) !== null && _a !== void 0 ? _a : [];
                    const channels = (_b = stateChanges.channels.removed) !== null && _b !== void 0 ? _b : [];
                    for (let serviceRequestIdx = serviceRequests.length - 1; serviceRequestIdx >= 0; serviceRequestIdx--) {
                        const serviceRequest = serviceRequests[serviceRequestIdx];
                        if (!serviceRequest.hasAnyChannelsOrGroups(channels, channelGroups))
                            continue;
                        cancelServiceRequest(serviceRequest);
                        serviceRequests.splice(serviceRequestIdx, 1);
                    }
                }
            }
            continuationRequests = this.squashSameClientRequests(continuationRequests);
            initialRequests = this.squashSameClientRequests(initialRequests);
            // --------------------------------------------------
            // Searching for optimal timetoken, which should be used for `service`-provided request (will override response with
            // new timetoken to make it possible to aggregate on next subscription loop with already ongoing `service`-provided
            // long-poll request).
            //
            (initialRequests.length ? continuationRequests : []).forEach((request) => {
                let shouldSetPreviousTimetoken = !decidedTimetokenOverride;
                if (!shouldSetPreviousTimetoken && request.timetoken !== '0') {
                    if (decidedTimetokenOverride === '0')
                        shouldSetPreviousTimetoken = true;
                    else if (request.timetoken < decidedTimetokenOverride)
                        shouldSetPreviousTimetoken = request.creationDate > timetokenOverrideRefreshTimestamp;
                }
                if (shouldSetPreviousTimetoken) {
                    timetokenOverrideRefreshTimestamp = request.creationDate;
                    decidedTimetokenOverride = request.timetoken;
                    decidedTimetokenRegionOverride = request.region;
                }
            });
            // --------------------------------------------------
            // Try to attach `initial` and `continuation` `client`-provided requests to ongoing `service`-provided requests.
            //
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
            this.attachToServiceRequest(serviceRequests, initialRequests);
            for (let initialRequestIdx = initialRequests.length - 1; initialRequestIdx >= 0; initialRequestIdx--) {
                const request = initialRequests[initialRequestIdx];
                serviceRequests.forEach((serviceRequest) => {
                    if (!request.isSubsetOf(serviceRequest) || serviceRequest.isInitialSubscribe)
                        return;
                    const { region, timetoken } = serviceRequest;
                    requestsWithInitialResponse.push({ request, timetoken, region: region });
                    initialRequests.splice(initialRequestIdx, 1);
                });
            }
            if (initialRequests.length) {
                let aggregationRequests;
                if (continuationRequests.length) {
                    decidedTimetokenOverride = Object.keys(continuationByTimetoken).sort().pop();
                    const requests = continuationByTimetoken[decidedTimetokenOverride];
                    decidedTimetokenRegionOverride = requests[0].region;
                    delete continuationByTimetoken[decidedTimetokenOverride];
                    requests.forEach((request) => request.resetToInitialRequest());
                    aggregationRequests = [...initialRequests, ...requests];
                }
                else
                    aggregationRequests = initialRequests;
                // Create handshake service request (if possible)
                this.createAggregatedRequest(aggregationRequests, newInitialServiceRequests, decidedTimetokenOverride, decidedTimetokenRegionOverride);
            }
            // Handle case when `initial` requests are supersets of continuation requests.
            Object.values(continuationByTimetoken).forEach((requestsByTimetoken) => {
                // Set `initial` `service`-provided requests as service requests for those continuation `client`-provided requests
                // that are a _subset_ of them.
                this.attachToServiceRequest(newInitialServiceRequests, requestsByTimetoken);
                // Set `ongoing` `service`-provided requests as service requests for those continuation `client`-provided requests
                // that are a _subset_ of them (if any still available).
                this.attachToServiceRequest(serviceRequests, requestsByTimetoken);
                // Create continuation `service`-provided request (if possible).
                this.createAggregatedRequest(requestsByTimetoken, newContinuationServiceRequests);
            });
            // --------------------------------------------------
            // Identify channels and groups for which presence `leave` should be generated.
            //
            const channelGroupsForLeave = new Set();
            const channelsForLeave = new Set();
            if (stateChanges &&
                removedRequests.length &&
                (stateChanges.channels.removed || stateChanges.channelGroups.removed)) {
                const channelGroups = (_c = stateChanges.channelGroups.removed) !== null && _c !== void 0 ? _c : [];
                const channels = (_d = stateChanges.channels.removed) !== null && _d !== void 0 ? _d : [];
                const client = removedRequests[0].client;
                changes
                    .filter((change) => change.remove && change.sendLeave)
                    .forEach((change) => {
                    const { channels: requestChannels, channelGroups: requestChannelsGroups } = change.request;
                    channelGroups.forEach((group) => requestChannelsGroups.includes(group) && channelGroupsForLeave.add(group));
                    channels.forEach((channel) => requestChannels.includes(channel) && channelsForLeave.add(channel));
                });
                serviceLeaveRequest = leaveRequest(client, [...channelsForLeave], [...channelGroupsForLeave]);
            }
            if (requestsWithInitialResponse.length ||
                newInitialServiceRequests.length ||
                newContinuationServiceRequests.length ||
                cancelledServiceRequests.length ||
                serviceLeaveRequest) {
                this.dispatchEvent(new SubscriptionStateChangeEvent(requestsWithInitialResponse, [...newInitialServiceRequests, ...newContinuationServiceRequests], cancelledServiceRequests, serviceLeaveRequest));
            }
        }
        /**
         * Refresh the internal subscription's state.
         */
        refreshInternalState() {
            const channelGroups = new Set();
            const channels = new Set();
            // Aggregate channels and groups from active requests.
            Object.entries(this.requests).forEach(([clientIdentifier, request]) => {
                var _a;
                var _b;
                const clientState = ((_a = (_b = this.clientsState)[clientIdentifier]) !== null && _a !== void 0 ? _a : (_b[clientIdentifier] = { channels: new Set(), channelGroups: new Set() }));
                request.channelGroups.forEach(clientState.channelGroups.add, clientState.channelGroups);
                request.channels.forEach(clientState.channels.add, clientState.channels);
                request.channelGroups.forEach(channelGroups.add, channelGroups);
                request.channels.forEach(channels.add, channels);
            });
            const changes = this.subscriptionStateChanges(channels, channelGroups);
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
            return changes;
        }
        // endregion
        // --------------------------------------------------------
        // ------------------- Event Handlers ---------------------
        // --------------------------------------------------------
        // region Event handlers
        addListenersForRequestEvents(request) {
            const abortController = (this.requestListenersAbort[request.identifier] = new AbortController());
            const cleanUpCallback = (evt) => {
                this.removeListenersFromRequestEvents(request);
                if (!request.isServiceRequest) {
                    if (this.requests[request.client.identifier]) {
                        this.lastCompletedRequest[request.client.identifier] = request;
                        delete this.requests[request.client.identifier];
                        const clientIdx = this.clientsForInvalidation.indexOf(request.client.identifier);
                        if (clientIdx > 0) {
                            this.clientsForInvalidation.splice(clientIdx, 1);
                            delete this.lastCompletedRequest[request.client.identifier];
                            delete this.clientsState[request.client.identifier];
                            // Check whether subscription state for all registered clients has been removed or not.
                            if (!Object.keys(this.clientsState).length)
                                this.dispatchEvent(new SubscriptionStateInvalidateEvent());
                        }
                    }
                    return;
                }
                const requestIdx = this.serviceRequests.indexOf(request);
                if (requestIdx >= 0)
                    this.serviceRequests.splice(requestIdx, 1);
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
        /**
         * Squash list of provided requests to represent latest request for each client.
         *
         * @param requests - List with potentially repetitive or multiple {@link SubscribeRequest|subscribe} requests for the
         * same {@link PubNubClient|PubNub} client.
         * @returns List of latest {@link SubscribeRequest|subscribe} requests for corresponding {@link PubNubClient|PubNub}
         * clients.
         */
        squashSameClientRequests(requests) {
            if (!requests.length || requests.length === 1)
                return requests;
            // Sort requests in order in which they have been created.
            const sortedRequests = requests.sort((lhr, rhr) => lhr.creationDate - rhr.creationDate);
            return Object.values(sortedRequests.reduce((acc, value) => {
                acc[value.client.identifier] = value;
                return acc;
            }, {}));
        }
        /**
         * Attach `client`-provided requests to the compatible ongoing `service`-provided requests.
         *
         * @param serviceRequests - List of ongoing `service`-provided subscribe requests.
         * @param requests - List of `client`-provided requests that should try to hook for service response using existing
         * ongoing `service`-provided requests.
         */
        attachToServiceRequest(serviceRequests, requests) {
            if (!serviceRequests.length || !requests.length)
                return;
            [...requests].forEach((request) => {
                for (const serviceRequest of serviceRequests) {
                    // Check whether continuation request is actually a subset of the `service`-provided request or not.
                    // Note: Second condition handled in the function which calls `attachToServiceRequest`.
                    if (!!request.serviceRequest ||
                        !request.isSubsetOf(serviceRequest) ||
                        (request.isInitialSubscribe && !serviceRequest.isInitialSubscribe))
                        continue;
                    // Attach to the matching `service`-provided request.
                    request.serviceRequest = serviceRequest;
                    // There is no need to aggregate attached request.
                    const requestIdx = requests.indexOf(request);
                    requests.splice(requestIdx, 1);
                    break;
                }
            });
        }
        /**
         * Create aggregated `service`-provided {@link SubscribeRequest|subscribe} request.
         *
         * @param requests - List of `client`-provided {@link SubscribeRequest|subscribe} requests which should be sent with
         * as single `service`-provided request.
         * @param serviceRequests - List with created `service`-provided {@link SubscribeRequest|subscribe} requests.
         * @param timetokenOverride - Timetoken that should replace the initial response timetoken.
         * @param regionOverride - Timetoken region that should replace the initial response timetoken region.
         */
        createAggregatedRequest(requests, serviceRequests, timetokenOverride, regionOverride) {
            if (requests.length === 0)
                return;
            const serviceRequest = SubscribeRequest.fromRequests(requests, this.accessToken, timetokenOverride, regionOverride);
            this.addListenersForRequestEvents(serviceRequest);
            requests.forEach((request) => (request.serviceRequest = serviceRequest));
            this.serviceRequests.push(serviceRequest);
            serviceRequests.push(serviceRequest);
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
                request.fetchAbortController = new AbortController();
            const fetchRequest = request.asFetchRequest;
            (() => __awaiter(this, void 0, void 0, function* () {
                Promise.race([
                    fetch(fetchRequest, Object.assign(Object.assign({}, (request.fetchAbortController ? { signal: request.fetchAbortController.signal } : {})), { keepalive: true })),
                    request.requestTimeoutTimer(),
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
                    request.stopRequestTimeoutTimer();
                    failure(fetchRequest, this.requestProcessingError(fetchError));
                });
            }))();
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

    /**
     * Aggregation timer timeout.
     *
     * Timeout used by the timer to postpone enqueued `subscribe` requests processing and let other clients for the same
     * subscribe key send next subscribe loop request (to make aggregation more efficient).
     */
    const aggregationTimeout = 50;
    /**
     * Sent {@link SubscribeRequest|subscribe} requests manager.
     *
     * Manager responsible for requests enqueue for batch processing and aggregated `service`-provided requests scheduling.
     */
    class SubscribeRequestsManager extends RequestsManager {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructors ---------------------
        // --------------------------------------------------------
        // region Constructors
        /**
         * Create a {@link SubscribeRequest|subscribe} requests manager.
         *
         * @param clientsManager - Reference to the {@link PubNubClient|PubNub} clients manager as an events source for new
         * clients for which {@link SubscribeRequest|subscribe} request sending events should be listened.
         */
        constructor(clientsManager) {
            super();
            this.clientsManager = clientsManager;
            /**
             * Map of change aggregation identifiers to the requests which should be processed at once.
             *
             * `requests` key contains a map of {@link PubNubClient|PubNub} client identifiers to requests created by it (usually
             * there is only one at a time).
             */
            this.requestsChangeAggregationQueue = {};
            /**
             * Map of client identifiers to {@link AbortController} instances which is used to detach added listeners when
             * {@link PubNubClient|PubNub} client unregisters.
             */
            this.clientAbortControllers = {};
            /**
             * Map of unique user identifier (composed from multiple request object properties) to the aggregated subscription
             * {@link SubscriptionState|state}.
             */
            this.subscriptionStates = {};
            this.addEventListenersForClientsManager(clientsManager);
        }
        // endregion
        // --------------------------------------------------------
        // ----------------- Changes aggregation ------------------
        // --------------------------------------------------------
        // region Changes aggregation
        /**
         * Retrieve {@link SubscribeRequest|requests} changes aggregation queue for specific {@link PubNubClient|PubNub}
         * client.
         *
         * @param client - Reference to {@link PubNubClient|PubNub} client for which {@link SubscribeRequest|subscribe}
         * requests queue should be retrieved.
         * @returns Tuple with aggregation key and aggregated changes of client's {@link SubscribeRequest|subscribe} requests
         * that are enqueued for aggregation/removal.
         */
        requestsChangeAggregationQueueForClient(client) {
            for (const aggregationKey of Object.keys(this.requestsChangeAggregationQueue)) {
                const { changes } = this.requestsChangeAggregationQueue[aggregationKey];
                if (Array.from(changes).some((change) => change.clientIdentifier === client.identifier))
                    return [aggregationKey, changes];
            }
            return [undefined, new Set()];
        }
        /**
         * Move {@link PubNubClient|PubNub} client to new subscription set.
         *
         * This function used when PubNub client changed its identity (`userId`) or auth (`access token`) and can't be
         * aggregated with previous requests.
         *
         * **Note:** Previous `service`-provided `subscribe` request won't be canceled.
         *
         * @param client - Reference to the  {@link PubNubClient|PubNub} client which should be moved to new state.
         */
        moveClient(client) {
            // Retrieve a list of client's requests that have been enqueued for further aggregation.
            const [queueIdentifier, enqueuedChanges] = this.requestsChangeAggregationQueueForClient(client);
            // Retrieve list of client's requests from active subscription state.
            let state = this.subscriptionStateForClient(client);
            const request = state === null || state === void 0 ? void 0 : state.requestForClient(client);
            // Check whether PubNub client has any activity prior removal or not.
            if (!state && !enqueuedChanges.size)
                return;
            // Make sure that client will be removed from its previous subscription state.
            if (state)
                state.invalidateClient(client);
            // Requests aggregation identifier.
            let identifier = request === null || request === void 0 ? void 0 : request.asIdentifier;
            if (!identifier && enqueuedChanges.size) {
                const [change] = enqueuedChanges;
                identifier = change.request.asIdentifier;
            }
            if (!identifier)
                return;
            //
            if (request) {
                // Unset `service`-provided request because we can't receive a response with new `userId`.
                request.serviceRequest = undefined;
                state.processChanges([new SubscriptionStateChange(client.identifier, request, true, false, true)]);
                state = this.subscriptionStateForIdentifier(identifier);
                // Force state refresh (because we are putting into new subscription set).
                request.resetToInitialRequest();
                state.processChanges([new SubscriptionStateChange(client.identifier, request, false, false)]);
            }
            // Check whether there is enqueued request changes which should be removed from previous queue and added to the new
            // one.
            if (!enqueuedChanges.size || !this.requestsChangeAggregationQueue[queueIdentifier])
                return;
            // Start the changes aggregation timer if required (this also prepares the queue for `identifier`).
            this.startAggregationTimer(identifier);
            // Remove from previous aggregation queue.
            const oldChangesQueue = this.requestsChangeAggregationQueue[queueIdentifier].changes;
            SubscriptionStateChange.squashedChanges([...enqueuedChanges])
                .filter((change) => change.clientIdentifier !== client.identifier || change.remove)
                .forEach(oldChangesQueue.delete, oldChangesQueue);
            // Add previously scheduled for aggregation requests to the new subscription set target.
            const { changes } = this.requestsChangeAggregationQueue[identifier];
            SubscriptionStateChange.squashedChanges([...enqueuedChanges])
                .filter((change) => change.clientIdentifier === client.identifier &&
                !change.request.completed &&
                change.request.canceled &&
                !change.remove)
                .forEach(changes.add, changes);
        }
        /**
         * Remove unregistered/disconnected {@link PubNubClient|PubNub} client from manager's {@link SubscriptionState|state}.
         *
         * @param client - Reference to the {@link PubNubClient|PubNub} client which should be removed from
         * {@link SubscriptionState|state}.
         * @param useChangeAggregation - Whether {@link PubNubClient|client} removal should be processed using an aggregation
         * queue or change should be done on-the-fly by removing from both the aggregation queue and subscription state.
         * @param sendLeave - Whether the {@link PubNubClient|client} should send a presence `leave` request for _free_
         * channels and groups or not.
         * @param [invalidated=false] - Whether the {@link PubNubClient|PubNub} client and its request were removed as part of
         * client invalidation (unregister) or not.
         */
        removeClient(client, useChangeAggregation, sendLeave, invalidated = false) {
            var _a;
            // Retrieve a list of client's requests that have been enqueued for further aggregation.
            const [queueIdentifier, enqueuedChanges] = this.requestsChangeAggregationQueueForClient(client);
            // Retrieve list of client's requests from active subscription state.
            const state = this.subscriptionStateForClient(client);
            const request = state === null || state === void 0 ? void 0 : state.requestForClient(client, invalidated);
            // Check whether PubNub client has any activity prior removal or not.
            if (!state && !enqueuedChanges.size)
                return;
            const identifier = (_a = (state && state.identifier)) !== null && _a !== void 0 ? _a : queueIdentifier;
            // Remove the client's subscription requests from the active aggregation queue.
            if (enqueuedChanges.size && this.requestsChangeAggregationQueue[identifier]) {
                const { changes } = this.requestsChangeAggregationQueue[identifier];
                enqueuedChanges.forEach(changes.delete, changes);
                this.stopAggregationTimerIfEmptyQueue(identifier);
            }
            if (!request)
                return;
            // Detach `client`-provided request to avoid unexpected response processing.
            request.serviceRequest = undefined;
            if (useChangeAggregation) {
                // Start the changes aggregation timer if required (this also prepares the queue for `identifier`).
                this.startAggregationTimer(identifier);
                // Enqueue requests into the aggregated state change queue (delayed).
                this.enqueueForAggregation(client, request, true, sendLeave, invalidated);
            }
            else if (state)
                state.processChanges([new SubscriptionStateChange(client.identifier, request, true, sendLeave, invalidated)]);
        }
        /**
         * Enqueue {@link SubscribeRequest|subscribe} requests for aggregation after small delay.
         *
         * @param client - Reference to the {@link PubNubClient|PubNub} client which created
         * {@link SubscribeRequest|subscribe} request.
         * @param enqueuedRequest - {@link SubscribeRequest|Subscribe} request which should be placed into the queue.
         * @param removing - Whether requests enqueued for removal or not.
         * @param sendLeave - Whether on remove it should leave "free" channels and groups or not.
         * @param [clientInvalidate=false] - Whether the `subscription` state change was caused by the
         * {@link PubNubClient|PubNub} client invalidation (unregister) or not.
         */
        enqueueForAggregation(client, enqueuedRequest, removing, sendLeave, clientInvalidate = false) {
            const identifier = enqueuedRequest.asIdentifier;
            // Start the changes aggregation timer if required (this also prepares the queue for `identifier`).
            this.startAggregationTimer(identifier);
            // Enqueue requests into the aggregated state change queue.
            const { changes } = this.requestsChangeAggregationQueue[identifier];
            changes.add(new SubscriptionStateChange(client.identifier, enqueuedRequest, removing, sendLeave, clientInvalidate));
        }
        /**
         * Start requests change aggregation timer.
         *
         * @param identifier - Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
         */
        startAggregationTimer(identifier) {
            if (this.requestsChangeAggregationQueue[identifier])
                return;
            this.requestsChangeAggregationQueue[identifier] = {
                timeout: setTimeout(() => this.handleDelayedAggregation(identifier), aggregationTimeout),
                changes: new Set(),
            };
        }
        /**
         * Stop request changes aggregation timer if there is no changes left in queue.
         *
         * @param identifier - Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
         */
        stopAggregationTimerIfEmptyQueue(identifier) {
            const queue = this.requestsChangeAggregationQueue[identifier];
            if (!queue)
                return;
            if (queue.changes.size === 0) {
                if (queue.timeout)
                    clearTimeout(queue.timeout);
                delete this.requestsChangeAggregationQueue[identifier];
            }
        }
        /**
         * Handle delayed {@link SubscribeRequest|subscribe} requests aggregation.
         *
         * @param identifier - Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
         */
        handleDelayedAggregation(identifier) {
            if (!this.requestsChangeAggregationQueue[identifier])
                return;
            const state = this.subscriptionStateForIdentifier(identifier);
            // Squash self-excluding change entries.
            const changes = [...this.requestsChangeAggregationQueue[identifier].changes];
            delete this.requestsChangeAggregationQueue[identifier];
            // Apply final changes to the subscription state.
            state.processChanges(changes);
        }
        /**
         * Retrieve existing or create new `subscription` {@link SubscriptionState|state} object for id.
         *
         * @param identifier - Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
         * @returns Existing or create new `subscription` {@link SubscriptionState|state} object for id.
         */
        subscriptionStateForIdentifier(identifier) {
            let state = this.subscriptionStates[identifier];
            if (!state) {
                state = this.subscriptionStates[identifier] = new SubscriptionState(identifier);
                // Make sure to receive updates from subscription state.
                this.addListenerForSubscriptionStateEvents(state);
            }
            return state;
        }
        // endregion
        // --------------------------------------------------------
        // ------------------- Event Handlers ---------------------
        // --------------------------------------------------------
        // region Event handlers
        /**
         * Listen for {@link PubNubClient|PubNub} clients {@link PubNubClientsManager|manager} events that affect aggregated
         * subscribe/heartbeat requests.
         *
         * @param clientsManager - Clients {@link PubNubClientsManager|manager} for which change in
         * {@link PubNubClient|clients} should be tracked.
         */
        addEventListenersForClientsManager(clientsManager) {
            clientsManager.addEventListener(PubNubClientsManagerEvent.Registered, (evt) => {
                const { client } = evt;
                // Keep track of the client's listener abort controller.
                const abortController = new AbortController();
                this.clientAbortControllers[client.identifier] = abortController;
                client.addEventListener(PubNubClientEvent.IdentityChange, () => this.moveClient(client), {
                    signal: abortController.signal,
                });
                client.addEventListener(PubNubClientEvent.AuthChange, () => this.moveClient(client), {
                    signal: abortController.signal,
                });
                client.addEventListener(PubNubClientEvent.SendSubscribeRequest, (event) => {
                    if (!(event instanceof PubNubClientSendSubscribeEvent))
                        return;
                    this.enqueueForAggregation(event.client, event.request, false, false);
                }, { signal: abortController.signal });
                client.addEventListener(PubNubClientEvent.CancelSubscribeRequest, (event) => {
                    if (!(event instanceof PubNubClientCancelSubscribeEvent))
                        return;
                    this.enqueueForAggregation(event.client, event.request, true, false);
                }, { signal: abortController.signal });
                client.addEventListener(PubNubClientEvent.SendLeaveRequest, (event) => {
                    if (!(event instanceof PubNubClientSendLeaveEvent))
                        return;
                    const request = this.patchedLeaveRequest(event.request);
                    if (!request)
                        return;
                    this.sendRequest(request, (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response), (fetchRequest, errorResponse) => request.handleProcessingError(fetchRequest, errorResponse));
                }, { signal: abortController.signal });
            });
            clientsManager.addEventListener(PubNubClientsManagerEvent.Unregistered, (event) => {
                const { client, withLeave } = event;
                // Remove all listeners added for the client.
                const abortController = this.clientAbortControllers[client.identifier];
                delete this.clientAbortControllers[client.identifier];
                if (abortController)
                    abortController.abort();
                // Update manager's state.
                this.removeClient(client, false, withLeave, true);
            });
        }
        /**
         * Listen for subscription {@link SubscriptionState|state} events.
         *
         * @param state - Reference to the subscription object for which listeners should be added.
         */
        addListenerForSubscriptionStateEvents(state) {
            const abortController = new AbortController();
            state.addEventListener(SubscriptionStateEvent.Changed, (event) => {
                const { requestsWithInitialResponse, canceledRequests, newRequests, leaveRequest } = event;
                // Cancel outdated ongoing `service`-provided subscribe requests.
                canceledRequests.forEach((request) => request.cancel('Cancel request'));
                // Schedule new `service`-provided subscribe requests processing.
                newRequests.forEach((request) => {
                    this.sendRequest(request, (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response), (fetchRequest, error) => request.handleProcessingError(fetchRequest, error), request.isInitialSubscribe && request.timetokenOverride !== '0'
                        ? (response) => this.patchInitialSubscribeResponse(response, request.timetokenOverride, request.timetokenRegionOverride)
                        : undefined);
                });
                requestsWithInitialResponse.forEach((response) => {
                    const { request, timetoken, region } = response;
                    request.handleProcessingStarted();
                    this.makeResponseOnHandshakeRequest(request, timetoken, region);
                });
                if (leaveRequest) {
                    this.sendRequest(leaveRequest, (fetchRequest, response) => leaveRequest.handleProcessingSuccess(fetchRequest, response), (fetchRequest, error) => leaveRequest.handleProcessingError(fetchRequest, error));
                }
            }, { signal: abortController.signal });
            state.addEventListener(SubscriptionStateEvent.Invalidated, () => {
                delete this.subscriptionStates[state.identifier];
                abortController.abort();
            }, {
                signal: abortController.signal,
                once: true,
            });
        }
        // endregion
        // --------------------------------------------------------
        // ----------------------- Helpers ------------------------
        // --------------------------------------------------------
        // region Helpers
        /**
         * Retrieve subscription {@link SubscriptionState|state} with which specific client is working.
         *
         * @param client - Reference to the {@link PubNubClient|PubNub} client for which subscription
         * {@link SubscriptionState|state} should be found.
         * @returns Reference to the subscription {@link SubscriptionState|state} if the client has ongoing
         * {@link SubscribeRequest|requests}.
         */
        subscriptionStateForClient(client) {
            return Object.values(this.subscriptionStates).find((state) => state.hasStateForClient(client));
        }
        /**
         * Create `service`-provided `leave` request from a `client`-provided {@link LeaveRequest|request} with channels and
         * groups for removal.
         *
         * @param request - Original `client`-provided `leave` {@link LeaveRequest|request}.
         * @returns `service`-provided `leave` request.
         */
        patchedLeaveRequest(request) {
            const subscriptionState = this.subscriptionStateForClient(request.client);
            // Something is wrong. Client doesn't have any active subscriptions.
            if (!subscriptionState) {
                request.cancel();
                return;
            }
            // Filter list from channels and groups which is still in use.
            const clientStateForLeave = subscriptionState.uniqueStateForClient(request.client, request.channels, request.channelGroups);
            const serviceRequest = leaveRequest(request.client, clientStateForLeave.channels, clientStateForLeave.channelGroups);
            if (serviceRequest)
                request.serviceRequest = serviceRequest;
            return serviceRequest;
        }
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
         * Patch `service`-provided subscribe response with new timetoken and region.
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
        /**
         * Heartbeat state has been invalidated after all clients' state was removed from it.
         */
        HeartbeatStateEvent["Invalidated"] = "invalidated";
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
    /**
     * Dispatched by heartbeat state when it has been invalidated.
     */
    class HeartbeatStateInvalidateEvent extends CustomEvent {
        /**
         * Create heartbeat state invalidation event.
         */
        constructor() {
            super(HeartbeatStateEvent.Invalidated);
        }
        /**
         * Create clone of invalidate event to make it possible to forward event upstream.
         *
         * @returns Client invalidate event.
         */
        clone() {
            return new HeartbeatStateInvalidateEvent();
        }
    }

    class HeartbeatRequest extends BasePubNubRequest {
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
            super(request, subscriptionKey, request.queryParameters.uuid, channels, channelGroups, accessToken);
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
         * Serialize request for easier representation in logs.
         *
         * @returns Stringified `heartbeat` request.
         */
        toString() {
            return `HeartbeatRequest { channels: [${this.channels.length ? this.channels.map((channel) => `'${channel}'`).join(', ') : ''}], channelGroups: [${this.channelGroups.length ? this.channelGroups.map((group) => `'${group}'`).join(', ') : ''}] }`;
        }
        /**
         * Serialize request to "typed" JSON string.
         *
         * @returns "Typed" JSON string.
         */
        toJSON() {
            return this.toString();
        }
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
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructor ----------------------
        // --------------------------------------------------------
        // region Constructor
        /**
         * Create heartbeat state management object.
         *
         * @param identifier -  Similar {@link SubscribeRequest|subscribe} requests aggregation identifier.
         */
        constructor(identifier) {
            super();
            this.identifier = identifier;
            // --------------------------------------------------------
            // ---------------------- Information ---------------------
            // --------------------------------------------------------
            // region Information
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
            if (!Object.keys(this.clientsState).length) {
                this.stopTimer();
                this.dispatchEvent(new HeartbeatStateInvalidateEvent());
            }
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
                    if (request && !!this.previousRequestResult) {
                        const fetchRequest = request.asFetchRequest;
                        const result = Object.assign(Object.assign({}, this.previousRequestResult), { clientIdentifier: request.client.identifier, identifier: request.identifier, url: fetchRequest.url });
                        request.handleProcessingStarted();
                        request.handleProcessingSuccess(fetchRequest, result);
                        return;
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
                if (!!heartbeatState.stateForClient(client))
                    return heartbeatState;
            return undefined;
        }
        /**
         * Move client between heartbeat states.
         *
         * This function used when PubNub client changed its identity (`userId`) or auth (`access token`) and can't be
         * aggregated with previous requests.
         *
         * @param client - Reference to the  {@link PubNubClient|PubNub} client which should be moved to new state.
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
                state = this.heartbeatStates[identifier] = new HeartbeatState(identifier);
                state.interval = (_a = client.heartbeatInterval) !== null && _a !== void 0 ? _a : 0;
                // Make sure to receive updates from heartbeat state.
                this.addListenerForHeartbeatStateEvents(state);
            }
            else if (client.heartbeatInterval &&
                state.interval > 0 &&
                client.heartbeatInterval > 0 &&
                client.heartbeatInterval < state.interval)
                state.interval = client.heartbeatInterval;
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
                client.addEventListener(PubNubClientEvent.IdentityChange, (event) => {
                    if (!(event instanceof PubNubClientIdentityChangeEvent))
                        return;
                    const state = this.heartbeatStateForClient(client);
                    const request = state ? state.requestForClient(client) : undefined;
                    if (request)
                        request.userId = event.newUserId;
                    this.moveClient(client);
                }, {
                    signal: abortController.signal,
                });
                client.addEventListener(PubNubClientEvent.AuthChange, (event) => {
                    if (!(event instanceof PubNubClientAuthChangeEvent))
                        return;
                    const state = this.heartbeatStateForClient(client);
                    const request = state ? state.requestForClient(client) : undefined;
                    if (request)
                        request.accessToken = event.newAuth;
                    this.moveClient(client);
                }, {
                    signal: abortController.signal,
                });
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
            const abortController = new AbortController();
            state.addEventListener(HeartbeatStateEvent.Heartbeat, (evt) => {
                const { request } = evt;
                this.sendRequest(request, (fetchRequest, response) => request.handleProcessingSuccess(fetchRequest, response), (fetchRequest, error) => request.handleProcessingError(fetchRequest, error));
            }, { signal: abortController.signal });
            state.addEventListener(HeartbeatStateEvent.Invalidated, () => {
                delete this.heartbeatStates[state.identifier];
                abortController.abort();
            }, { signal: abortController.signal, once: true });
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
            /**
             * Whether {@link PubNubClient|PubNub} client has been invalidated (unregistered) or not.
             */
            this._invalidated = false;
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
            this._invalidated = true;
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
         * Retrieve whether the {@link PubNubClient|PubNub} client has been invalidated (unregistered) or not.
         *
         * @returns `true` if the client has been invalidated during unregistration.
         */
        get isInvalidated() {
            return this._invalidated;
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
            if (!!authKey || !!this.accessToken) {
                const accessToken = authKey ? new AccessToken(authKey, (token !== null && token !== void 0 ? token : {}).token, (token !== null && token !== void 0 ? token : {}).expiration) : undefined;
                // Check whether the access token really changed or not.
                if (!!accessToken !== !!this.accessToken ||
                    (!!accessToken && this.accessToken && !accessToken.equalTo(this.accessToken))) {
                    const oldValue = this._accessToken;
                    this._accessToken = accessToken;
                    // Make sure that all ongoing subscribe (usually should be only one at a time) requests use proper
                    // `accessToken`.
                    Object.values(this.requests)
                        .filter((request) => (!request.completed && request instanceof SubscribeRequest) || request instanceof HeartbeatRequest)
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
                    .filter((request) => (!request.completed && request instanceof SubscribeRequest) || request instanceof HeartbeatRequest)
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
            var _a;
            let request;
            // Setup client's authentication token from request (if it hasn't been set yet)
            if (!this._accessToken && !!((_a = data.request.queryParameters) === null || _a === void 0 ? void 0 : _a.auth) && !!data.preProcessedToken) {
                const auth = data.request.queryParameters.auth;
                this._accessToken = new AccessToken(auth, data.preProcessedToken.token, data.preProcessedToken.expiration);
            }
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
         * **Note:** Cancellation will dispatch the event handled in `listenRequestCompletion` and remove target request from
         * the PubNub client requests' list.
         *
         * @param data - Object with canceled request information.
         */
        handleCancelRequestEvent(data) {
            if (!this.requests[data.identifier])
                return;
            const request = this.requests[data.identifier];
            request.cancel('Cancel request');
        }
        /**
         * Handle PubNub client disconnect event.
         *
         * **Note:** On disconnect, the core {@link PubNubClient|PubNub} client module will terminate `client`-provided
         * subscribe requests ({@link handleCancelRequestEvent} will be called).
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
                delete this.requests[request.identifier];
                ac.abort();
                if (evt instanceof RequestSuccessEvent)
                    this.postEvent(evt.response);
                else if (evt instanceof RequestErrorEvent)
                    this.postEvent(evt.error);
                else if (evt instanceof RequestCancelEvent) {
                    this.postEvent(this.requestCancelError(request));
                    // Notify specifically about the `subscribe` request cancellation.
                    if (!this._invalidated && request instanceof SubscribeRequest)
                        this.dispatchEvent(new PubNubClientCancelSubscribeEvent(request.client, request));
                }
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
         * Cancel any active `client`-provided requests.
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

    /**
     * Registered {@link PubNubClient|PubNub} client instances manager.
     *
     * Manager responsible for keeping track and interaction with registered {@link PubNubClient|PubNub}.
     */
    class PubNubClientsManager extends EventTarget {
        // endregion
        // --------------------------------------------------------
        // --------------------- Constructors ---------------------
        // --------------------------------------------------------
        // region Constructors
        /**
         * Create {@link PubNubClient|PubNub} clients manager.
         *
         * @param sharedWorkerIdentifier - Unique `Subscription` worker identifier that will work with clients.
         */
        constructor(sharedWorkerIdentifier) {
            super();
            this.sharedWorkerIdentifier = sharedWorkerIdentifier;
            // --------------------------------------------------------
            // ---------------------- Information ---------------------
            // --------------------------------------------------------
            // region Information
            /**
             * Map of started `PING` timeouts per subscription key.
             */
            this.timeouts = {};
            /**
             * Map of previously created {@link PubNubClient|PubNub} clients.
             */
            this.clients = {};
            /**
             * Map of previously created {@link PubNubClient|PubNub} clients to the corresponding subscription key.
             */
            this.clientBySubscribeKey = {};
        }
        // endregion
        // --------------------------------------------------------
        // ----------------- Client registration ------------------
        // --------------------------------------------------------
        // region Client registration
        /**
         * Create {@link PubNubClient|PubNub} client.
         *
         * Function called in response to the `client-register` from the core {@link PubNubClient|PubNub} client module.
         *
         * @param event - Registration event with base {@link PubNubClient|PubNub} client information.
         * @param port - Message port for two-way communication with core {@link PubNubClient|PubNub} client module.
         * @returns New {@link PubNubClient|PubNub} client or existing one from the cache.
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
         * Store {@link PubNubClient|PubNub} client in manager's internal state.
         *
         * @param client - Freshly created {@link PubNubClient|PubNub} client which should be registered.
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
            this.dispatchEvent(new PubNubClientManagerRegisterEvent(client));
        }
        /**
         * Remove {@link PubNubClient|PubNub} client from manager's internal state.
         *
         * @param client - Previously created {@link PubNubClient|PubNub} client which should be removed.
         * @param withLeave - Whether `leave` request should be sent or not.
         */
        unregisterClient(client, withLeave = false) {
            if (!this.clients[client.identifier])
                return;
            // Make sure to detach all listeners for this `client`.
            if (this.clients[client.identifier].abortController)
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
            client.invalidate();
            this.dispatchEvent(new PubNubClientManagerUnregisterEvent(client, withLeave));
        }
        // endregion
        // --------------------------------------------------------
        // ----------------- Availability check -------------------
        // --------------------------------------------------------
        // region Availability check
        /**
         * Start timer for _timeout_ {@link PubNubClient|PubNub} client checks.
         *
         * @param subKey - Subscription key to get list of {@link PubNubClient|PubNub} clients that should be checked.
         * @param interval - Interval at which _timeout_ check should be done.
         * @param unsubscribeOffline - Whether _timeout_ (or _offline_) {@link PubNubClient|PubNub} clients should send
         * `leave` request before invalidation or not.
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
         * Stop _timeout_ (or _offline_) {@link PubNubClient|PubNub} clients pinging.
         *
         * **Note:** This method is used only when all clients for a specific subscription key have been unregistered.
         *
         * @param client - {@link PubNubClient|PubNub} client with which the last client related by subscription key has been
         * removed.
         */
        stopClientTimeoutCheck(client) {
            if (!this.timeouts[client.subKey])
                return;
            if (this.timeouts[client.subKey].timeout)
                clearTimeout(this.timeouts[client.subKey].timeout);
            delete this.timeouts[client.subKey];
        }
        /**
         * Handle periodic {@link PubNubClient|PubNub} client timeout checks.
         *
         * @param subKey - Subscription key to get list of {@link PubNubClient|PubNub} clients that should be checked.
         */
        handleTimeoutCheck(subKey) {
            if (!this.timeouts[subKey])
                return;
            const interval = this.timeouts[subKey].interval;
            [...this.clientBySubscribeKey[subKey]].forEach((client) => {
                // Handle potential SharedWorker timers throttling and early eviction of the PubNub core client.
                // If timer fired later than specified interval - it has been throttled and shouldn't unregister client.
                if (client.lastPingRequest && Date.now() / 1000 - client.lastPingRequest > interval * 0.5) {
                    client.logger.warn('PubNub clients timeout timer fired after throttling past due time.');
                    client.lastPingRequest = undefined;
                }
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
                    client.lastPingRequest = Date.now() / 1000;
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
         * Listen for {@link PubNubClient|PubNub} client events that affect aggregated subscribe/heartbeat requests.
         *
         * @param client - {@link PubNubClient|PubNub} client for which event should be listened.
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
         * Call callback function for all {@link PubNubClient|PubNub} clients that have similar `subscribeKey`.
         *
         * @param subKey - Subscription key for which list of clients should be retrieved.
         * @param callback - Function that will be called for each client list entry.
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
