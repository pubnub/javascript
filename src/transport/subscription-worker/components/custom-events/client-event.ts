import { SubscribeRequest } from '../subscribe-request';
import { HeartbeatRequest } from '../heartbeat-request';
import { PubNubClient } from '../pubnub-client';
import { LeaveRequest } from '../leave-request';
import { AccessToken } from '../access-token';

/**
 * Type with events which is emitted by PubNub client and can be handled with callback passed to the
 * {@link EventTarget#addEventListener|addEventListener}.
 */
export enum PubNubClientEvent {
  /**
   * Client unregistered (no connection through SharedWorker connection ports).
   *
   */
  Unregister = 'unregister',

  /**
   * Client temporarily disconnected.
   */
  Disconnect = 'disconnect',

  /**
   * User ID for current PubNub client has been changed.
   *
   * On identity change for proper further operation expected following actions:
   * - send immediate heartbeat with new `user ID` (if has been sent before)
   * - start subscribe long-poll request with new `user ID` (if has been sent before). If it required, cancel previous
   * long-poll request.
   */
  IdentityChange = 'identityChange',

  /**
   * Authentication token change event.
   *
   * On authentication token change for proper further operation expected following actions:
   * - cached `subscribe` request query parameter updated
   * - cached `heartbeat` request query parameter updated
   */
  AuthChange = 'authChange',

  /**
   * Presence heartbeat interval change event.
   *
   * On heartbeat interval change for proper further operation expected following actions:
   * - restart _backup_ heartbeat timer with new interval.
   */
  HeartbeatIntervalChange = 'heartbeatIntervalChange',

  /**
   * Core PubNub client module request to send `subscribe` request.
   */
  SendSubscribeRequest = 'sendSubscribeRequest',

  /**
   * Core PubNub client module request to send `heartbeat` request.
   */
  SendHeartbeatRequest = 'sendHeartbeatRequest',

  /**
   * Core PubNub client module request to send `leave` request.
   */
  SendLeaveRequest = 'sendLeaveRequest',
}

/**
 * Base request processing event class.
 */
class BasePubNubClientEvent<T = object> extends CustomEvent<{ client: PubNubClient } & T> {
  /**
   * Retrieve reference to PubNub client which dispatched event.
   *
   * @returns Reference to PubNub client which dispatched event.
   */
  get client(): PubNubClient {
    return this.detail.client;
  }
}

/**
 * Dispatched by PubNub client when it has been unregistered.
 */
export class PubNubClientUnregisterEvent extends BasePubNubClientEvent {
  /**
   * Create PubNub client unregister event.
   *
   * @param client - Reference to unregistered PubNub client.
   */
  constructor(client: PubNubClient) {
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
export class PubNubClientDisconnectEvent extends BasePubNubClientEvent {
  /**
   * Create PubNub client disconnect event.
   *
   * @param client - Reference to disconnected PubNub client.
   */
  constructor(client: PubNubClient) {
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
export class PubNubClientIdentityChangeEvent extends BasePubNubClientEvent<{
  oldUserId: string;
  newUserId: string;
}> {
  /**
   * Create PubNub client identity change event.
   *
   * @param client - Reference to the PubNub client which changed identity.
   * @param oldUserId - User ID which has been previously used by the `client`.
   * @param newUserId - User ID which will used by the `client`.
   */
  constructor(client: PubNubClient, oldUserId: string, newUserId: string) {
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
export class PubNubClientAuthChangeEvent extends BasePubNubClientEvent<{
  oldAuth?: AccessToken;
  newAuth: AccessToken;
}> {
  /**
   * Create PubNub client authentication change event.
   *
   * @param client - Reference to the PubNub client which changed authentication.
   * @param newAuth - Authentication which will used by the `client`.
   * @param [oldAuth] - Authentication which has been previously used by the `client`.
   */
  constructor(client: PubNubClient, newAuth: AccessToken, oldAuth?: AccessToken) {
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
export class PubNubClientHeartbeatIntervalChangeEvent extends BasePubNubClientEvent<{
  oldInterval?: number;
  newInterval?: number;
}> {
  /**
   * Create PubNub client heartbeat interval change event.
   *
   * @param client - Reference to the PubNub client which changed heartbeat interval.
   * @param [newInterval] - New heartbeat request send interval.
   * @param [oldInterval] - Previous heartbeat request send interval.
   */
  constructor(client: PubNubClient, newInterval?: number, oldInterval?: number) {
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
export class PubNubClientSendSubscribeEvent extends BasePubNubClientEvent<{
  request: SubscribeRequest;
}> {
  /**
   * Create subscribe request send event.
   *
   * @param client - Reference to the PubNub client which requested to send request.
   * @param request - Subscription request object.
   */
  constructor(client: PubNubClient, request: SubscribeRequest) {
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
export class PubNubClientSendHeartbeatEvent extends BasePubNubClientEvent<{
  request: HeartbeatRequest;
}> {
  /**
   * Create heartbeat request send event.
   *
   * @param client - Reference to the PubNub client which requested to send request.
   * @param request - Heartbeat request object.
   */
  constructor(client: PubNubClient, request: HeartbeatRequest) {
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
export class PubNubClientSendLeaveEvent extends BasePubNubClientEvent<{
  request: LeaveRequest;
}> {
  /**
   * Create leave request send event.
   *
   * @param client - Reference to the PubNub client which requested to send request.
   * @param request - Leave request object.
   */
  constructor(client: PubNubClient, request: LeaveRequest) {
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
