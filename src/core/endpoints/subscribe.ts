/**
 * Subscription REST API module.
 */

import { createMalformedResponseError, createValidationError, PubNubError } from '../../errors/pubnub-error';
import { TransportResponse } from '../types/transport-response';
import { ICryptoModule } from '../interfaces/crypto-module';
import { encodeNames, messageFingerprint } from '../utils';
import * as Subscription from '../types/api/subscription';
import { AbstractRequest } from '../components/request';
import * as FileSharing from '../types/api/file-sharing';
import RequestOperation from '../constants/operations';
import * as AppContext from '../types/api/app-context';
import { KeySet, Payload, Query } from '../types/api';

// --------------------------------------------------------
// ---------------------- Defaults ------------------------
// --------------------------------------------------------
// region Defaults

/**
 * Whether should subscribe to channels / groups presence announcements or not.
 */
const WITH_PRESENCE = false;

// endregion

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * PubNub-defined event types by payload.
 */
export enum PubNubEventType {
  /**
   * Presence change event.
   */
  Presence = -2,

  /**
   * Regular message event.
   *
   * **Note:** This is default type assigned for non-presence events if `e` field is missing.
   */
  Message = -1,

  /**
   * Signal data event.
   */
  Signal = 1,

  /**
   * App Context object event.
   */
  AppContext,

  /**
   * Message reaction event.
   */
  MessageAction,

  /**
   * Files event.
   */
  Files,

  /**
   * DataSync object change event.
   *
   * **Note:** Value must equal `5` to match the service wire value (`e: 5`).
   */
  DataSync,
}

/**
 * Event types which this SDK version knows how to parse.
 *
 * Events with any other `e` value are ignored: they most likely originate from a service release newer than
 * the SDK
 */
const KNOWN_EVENT_TYPES: ReadonlySet<PubNubEventType> = new Set([
  PubNubEventType.Presence,
  PubNubEventType.Message,
  PubNubEventType.Signal,
  PubNubEventType.AppContext,
  PubNubEventType.MessageAction,
  PubNubEventType.Files,
  PubNubEventType.DataSync,
]);

/**
 * Time cursor.
 *
 * Cursor used by subscription loop to identify point in time after which updates will be
 * delivered.
 */
type SubscriptionCursor = {
  /**
   * PubNub high-precision timestamp.
   *
   * Aside of specifying exact time of receiving data / event this token used to catchup /
   * follow on real-time updates.
   */
  t: string;

  /**
   * Data center region for which `timetoken` has been generated.
   */
  r: number;
};

// endregion

// region Presence service response
/**
 * Periodical presence change service response.
 */
type PresenceIntervalData = {
  /**
   * Periodical subscribed channels and groups presence change announcement.
   */
  action: 'interval';

  /**
   * Unix timestamp when presence event has been triggered.
   */
  timestamp: number;

  /**
   * The current occupancy after the presence change is updated.
   */
  occupancy: number;

  /**
   * The list of unique user identifiers that `joined` the channel since the last interval
   * presence update.
   */
  join?: string[];

  /**
   * The list of unique user identifiers that `left` the channel since the last interval
   * presence update.
   */
  leave?: string[];

  /**
   * The list of unique user identifiers that `timeout` the channel since the last interval
   * presence update.
   */
  timeout?: string[];

  /**
   * Indicates whether presence should be requested manually using {@link PubNubCore.hereNow hereNow()}
   * or not.
   *
   * Depending on from the presence activity, the resulting interval update can be too large to be
   * returned as a presence event with subscribe REST API response. The server will set this flag to
   * `true` in this case.
   */
  hereNowRefresh: boolean;

  /**
   * Indicates whether presence should be requested manually or not.
   *
   * **Warning:** This is internal property which will be removed after processing.
   *
   * @internal
   */
  here_now_refresh?: boolean;
};

/**
 * Subscribed user presence information change service response.
 */
type PresenceChangeData = {
  /**
   * Change if user's presence.
   *
   * User's presence may change between: `join`, `leave` and `timeout`.
   */
  action: 'join' | 'leave' | 'timeout';

  /**
   * Unix timestamp when presence event has been triggered.
   */
  timestamp: number;

  /**
   * Unique identification of the user for whom presence information changed.
   */
  uuid: string;

  /**
   * The current occupancy after the presence change is updated.
   */
  occupancy: number;

  /**
   * The user's state associated with the channel has been updated.
   *
   * @deprecated Use set state methods to specify associated user's data instead of passing to
   * subscribe.
   */
  data?: { [p: string]: Payload };
};

/**
 * Associated user presence state change service response.
 */
type PresenceStateChangeData = {
  /**
   * Subscribed user associated presence state change.
   */
  action: 'state-change';

  /**
   * Unix timestamp when presence event has been triggered.
   */
  timestamp: number;

  /**
   * Unique identification of the user for whom associated presence state has been changed.
   */
  uuid: string;

  /**
   * The user's state associated with the channel has been updated.
   */
  state: { [p: string]: Payload };
};

/**
 * Channel presence service response.
 */
export type PresenceData = PresenceIntervalData | PresenceChangeData | PresenceStateChangeData;
// endregion

// region Message Actions service response
/**
 * Message reaction change service response.
 */
export type MessageActionData = {
  /**
   * The type of event that happened during the message action update.
   *
   * Possible values are:
   * - `added` - action has been added to the message
   * - `removed` - action has been removed from message
   */
  event: 'added' | 'removed';

  /**
   * Information about message action for which update has been generated.
   */
  data: {
    /**
     * Timetoken of message for which action has been added / removed.
     */
    messageTimetoken: string;

    /**
     * Timetoken of message action which has been added / removed.
     */
    actionTimetoken: string;

    /**
     * Message action type.
     */
    type: string;

    /**
     * Value associated with message action {@link type}.
     */
    value: string;
  };

  /**
   * Name of service which generated update for message action.
   */
  source: string;

  /**
   * Version of service which generated update for message action.
   */
  version: string;
};
// endregion

// region App Context service data
/**
 * VSP Objects change events.
 */
type AppContextVSPEvents = 'updated' | 'removed';

/**
 * App Context Objects change events.
 */
type AppContextEvents = 'set' | 'delete';

/**
 * Common real-time App Context Object service response.
 */
type ObjectData<Event extends string, Type extends string, AppContextObject> = {
  /**
   * The type of event that happened during the object update.
   */
  event: Event;

  /**
   * App Context object type.
   */
  type: Type;

  /**
   * App Context object information.
   *
   * App Context object can be one of:
   * - `channel` / `space`
   * - `uuid` / `user`
   * - `membership`
   */
  data: AppContextObject;

  /**
   * Name of service which generated update for object.
   */
  source: string;

  /**
   * Version of service which generated update for object.
   */
  version: string;
};

/**
 * `Channel` object change real-time service response.
 */
type ChannelObjectData = ObjectData<
  AppContextEvents,
  'channel',
  AppContext.ChannelMetadataObject<AppContext.CustomData>
>;

/**
 * `Space` object change real-time service response.
 */
export type SpaceObjectData = ObjectData<
  AppContextVSPEvents,
  'space',
  AppContext.ChannelMetadataObject<AppContext.CustomData>
>;

/**
 * `Uuid` object change real-time service response.
 */
type UuidObjectData = ObjectData<AppContextEvents, 'uuid', AppContext.UUIDMetadataObject<AppContext.CustomData>>;

/**
 * `User` object change real-time service response.
 */
export type UserObjectData = ObjectData<
  AppContextVSPEvents,
  'user',
  AppContext.UUIDMetadataObject<AppContext.CustomData>
>;

/**
 * `Membership` object change real-time service response.
 */
type MembershipObjectData = ObjectData<
  AppContextEvents,
  'membership',
  Omit<AppContext.ObjectData<AppContext.CustomData>, 'id'> & {
    /**
     * User membership status.
     */
    status?: string;

    /**
     * User membership type.
     */
    type?: string;

    /**
     * `Uuid` object which has been used to create relationship with `channel`.
     */
    uuid: {
      /**
       * Unique `user` object identifier.
       */
      id: string;
    };

    /**
     * `Channel` object which has been used to create relationship with `uuid`.
     */
    channel: {
      /**
       * Unique `channel` object identifier.
       */
      id: string;
    };
  }
>;

/**
 * VSP `Membership` object change real-time service response.
 */
export type VSPMembershipObjectData = ObjectData<
  AppContextVSPEvents,
  'membership',
  Omit<AppContext.ObjectData<AppContext.CustomData>, 'id'> & {
    /**
     * `User` object which has been used to create relationship with `space`.
     */
    user: {
      /**
       * Unique `user` object identifier.
       */
      id: string;
    };

    /**
     * `Space` object which has been used to create relationship with `user`.
     */
    space: {
      /**
       * Unique `channel` object identifier.
       */
      id: string;
    };
  }
>;

/**
 * App Context service response.
 */
export type AppContextObjectData = ChannelObjectData | UuidObjectData | MembershipObjectData;
// endregion

// region DataSync service response
/**
 * DataSync change event kinds.
 */
type DataSyncEventName = 'create' | 'update' | 'delete';

/**
 * DataSync object kind.
 *
 * The service reports the semantic kind for its own built-in classes (`user` / `channel` /
 * `membership`) and the generic storage kind for developer-defined ones (`entity` / `relationship`).
 * Used both for the kind as sent ({@link DataSyncData.type}) and for the kind normalized across
 * service versions ({@link DataSyncData.objectType}).
 */
export type DataSyncObjectType = 'user' | 'channel' | 'membership' | 'entity' | 'relationship';

/**
 * Scope of the class definition a DataSync object belongs to.
 *
 * `Global` identifies the built-in classes provided by the service (`User`, `Channel`,
 * `Membership`); `SubKey` identifies classes defined by the developer on their own key set.
 */
export type DataSyncClassLevel = 'Global' | 'SubKey';

/**
 * Reserved DataSync system class names (lower-cased) → normalized object kind.
 *
 * Only consulted when the wire {@link DataSyncData.type} is the generic `entity` / `relationship`
 * kind, and only for classes the service marks as `Global` (see {@link DataSyncClassLevel}) — so a
 * developer-defined class which happens to share one of these names is not mistaken for a typed
 * resource. Keys are compared case-insensitively.
 *
 * @internal
 */
const DATA_SYNC_RESERVED_CLASSES: Record<string, DataSyncObjectType> = {
  user: 'user',
  channel: 'channel',
  membership: 'membership',
};

/**
 * DataSync entity change payload (create / update).
 *
 * Mirrors the object as sent by the service. Class identity is not repeated here: it is reported once
 * on the event itself as {@link DataSyncData.className} / {@link DataSyncData.classLevel} /
 * {@link DataSyncData.classVersion}.
 */
export type DataSyncEntityData = {
  /**
   * Unique entity identifier.
   */
  id: string;

  /**
   * Lifecycle status.
   */
  status?: string;

  /**
   * User-defined JSON payload.
   *
   * A JSON object, like the REST-side entity payload. Stays assignable to {@link Payload}, so an
   * event body can be forwarded to any payload-taking API without a cast.
   */
  payload?: Record<string, Payload | null>;

  /**
   * Date and time the entity was created (ISO 8601).
   */
  createdAt?: string;

  /**
   * Date and time the entity was last updated (ISO 8601).
   */
  updatedAt?: string;

  /**
   * Content fingerprint for optimistic concurrency control.
   */
  eTag?: string;

  /**
   * Auto-deletion timestamp (ISO 8601).
   */
  expiresAt?: string;
};

/**
 * DataSync relationship change payload (create / update).
 *
 * Class identity is not repeated here: it is reported once on the event itself as
 * {@link DataSyncData.className} / {@link DataSyncData.classLevel} / {@link DataSyncData.classVersion}.
 */
export type DataSyncRelationshipData = DataSyncEntityData & {
  /**
   * First entity id in the relationship.
   */
  entityAId?: string;

  /**
   * Second entity id in the relationship.
   */
  entityBId?: string;
};

/**
 * DataSync membership change payload (create / update).
 *
 * A membership is stored as a relationship, but the service names its endpoints semantically —
 * `channelId` / `userId` instead of `entityAId` / `entityBId` — matching the REST
 * `MembershipObject`. Class identity is not repeated here: it is reported once on the event itself as
 * {@link DataSyncData.className} / {@link DataSyncData.classLevel} / {@link DataSyncData.classVersion}.
 */
export type DataSyncMembershipData = DataSyncEntityData & {
  /**
   * Id of the channel the membership joins.
   */
  channelId?: string;

  /**
   * Id of the user the membership joins.
   */
  userId?: string;
};

/**
 * DataSync delete change payload.
 */
export type DataSyncDeleteData = {
  /**
   * Unique identifier of the removed object.
   */
  id: string;

  /**
   * Date and time the object was removed (ISO 8601).
   */
  deletedAt?: string;
};

/**
 * Parsed DataSync change event for a single `event` / `objectType` combination.
 *
 * Building block of the {@link DataSyncData} union; not meant to be named directly.
 */
type DataSyncChangeEvent<
  Event extends DataSyncEventName,
  ObjectType extends DataSyncObjectType,
  Data extends DataSyncEntityData | DataSyncDeleteData,
> = {
  /**
   * DataSync service payload version.
   */
  version?: string;

  /**
   * The type of change which happened to the object.
   */
  event: Event;

  /**
   * Name of the service which generated the update (always `data-sync`).
   */
  source: string;

  /**
   * Raw DataSync object kind as sent by the service.
   */
  type: DataSyncObjectType;

  /**
   * Normalized DataSync object kind.
   *
   * The built-in `User` / `Channel` / `Membership` classes map to `'user'` / `'channel'` /
   * `'membership'`; developer-defined classes to `'entity'` / `'relationship'`. Use this to
   * discriminate typed resources without knowing class-name strings.
   *
   * Normally identical to the wire {@link type}; it differs only for a service which still reports
   * the built-in classes under the generic `'entity'` / `'relationship'` kind, where it is derived
   * from {@link className} / {@link classLevel} instead.
   */
  objectType: ObjectType;

  /**
   * Object class name.
   */
  className?: string;

  /**
   * Scope of the class definition: `Global` for the built-in classes (`User` / `Channel` /
   * `Membership`), `SubKey` for classes defined by the developer on their own key set.
   */
  classLevel?: DataSyncClassLevel;

  /**
   * Version of the object class schema (parsed from the wire `classVersion`).
   */
  classVersion?: number;

  /**
   * Changed object information.
   *
   * For `delete` events only `{ id, deletedAt }` is populated.
   */
  data: Data;
};

/**
 * Parsed DataSync change event (dispatched under `message`).
 *
 * Discriminated by {@link DataSyncChangeEvent.event | event} and
 * {@link DataSyncChangeEvent.objectType | objectType}, so narrowing on either tells the compiler the
 * exact shape of `data`: a `delete` carries only `{ id, deletedAt }`, a `membership` names its
 * endpoints `channelId` / `userId`, and a developer-defined `relationship` names them
 * `entityAId` / `entityBId`.
 */
export type DataSyncData =
  | DataSyncChangeEvent<'create' | 'update', 'user' | 'channel' | 'entity', DataSyncEntityData>
  | DataSyncChangeEvent<'create' | 'update', 'relationship', DataSyncRelationshipData>
  | DataSyncChangeEvent<'create' | 'update', 'membership', DataSyncMembershipData>
  | DataSyncChangeEvent<'delete', DataSyncObjectType, DataSyncDeleteData>;

/**
 * Raw DataSync envelope payload (before parsing).
 *
 * @internal
 */
type DataSyncServiceData = {
  version?: string;
  metadata?: {
    event?: DataSyncEventName;
    source?: string;
    type?: DataSyncObjectType;
    className?: string;
    classLevel?: string;
    classVersion?: string | number;
  };
  data?: Record<string, unknown>;
};
// endregion

// region File service response
/**
 * File service response.
 */
export type FileData = {
  /**
   * Message which has been associated with uploaded file.
   */
  message?: Payload;

  /**
   * Information about uploaded file.
   */
  file: {
    /**
     * Unique identifier of uploaded file.
     */
    id: string;

    /**
     * Actual name with which file has been stored.
     */
    name: string;
  };
};
// endregion

/**
 * Service response data envelope.
 *
 * Each entry from `m` list wrapped into this object.
 *
 * @internal
 */
type Envelope = {
  /**
   * Shard number on which the event has been stored.
   */
  a: string;

  /**
   * A numeric representation of enabled debug flags.
   */
  f: number;

  /**
   * PubNub defined event type.
   */
  e?: PubNubEventType;

  /**
   * Identifier of client which sent message (set only when Publish REST API endpoint called with
   * `uuid`).
   */
  i?: string;

  /**
   * Sequence number (set only when Publish REST API endpoint called with `seqn`).
   */
  s?: number;

  /**
   * Event "publish" time.
   *
   * This is the time when message has been received by {@link https://www.pubnub.com|PubNub} network.
   */
  p: SubscriptionCursor;

  /**
   * User-defined (local) "publish" time.
   */
  o?: SubscriptionCursor;

  /**
   * Name of channel where update received.
   */
  c: string;

  /**
   * Event payload.
   *
   * **Note:** One more type not mentioned here to keep type system working ({@link Payload}).
   */
  d: PresenceData | MessageActionData | AppContextObjectData | FileData | string;

  /**
   * Actual name of subscription through which event has been delivered.
   *
   * PubNub client can be used to subscribe to the group of channels to receive updates and
   * (group name will be set for field). With this approach there will be no need to separately
   * add *N* number of channels to `subscribe` method call.
   */
  b?: string;

  /**
   * User-provided metadata during `publish` method usage.
   */
  u?: { [p: string]: Payload };

  /**
   * User-provided message type (set only when `publish` called with `type`).
   */
  cmt?: string;

  /**
   * Identifier of space into which message has been published (set only when `publish` called
   * with `space_id`).
   */
  si?: string;
};

/**
 * Subscribe REST API service success response.
 *
 * @internal
 */
type ServiceResponse = {
  /**
   * Next subscription cursor.
   *
   * The cursor contains information about the start of the next real-time update timeframe.
   */
  t: SubscriptionCursor;

  /**
   * List of updates.
   *
   * Contains list of real-time updates received using previous subscription cursor.
   */
  m: Envelope[];
};

/**
 * Request configuration parameters.
 *
 * @internal
 */
export type SubscribeRequestParameters = Subscription.SubscribeParameters & {
  /**
   * Timetoken's region identifier.
   */
  region?: number;

  /**
   * Subscriber `userId` presence timeout.
   *
   * For how long (in seconds) user will be `online` without sending any new subscribe or
   * heartbeat requests.
   */
  heartbeat?: number;

  /**
   * Real-time events filtering expression.
   */
  filterExpression?: string | null;

  /**
   * PubNub REST API access key set.
   */
  keySet: KeySet;

  /**
   * Received data decryption module.
   */
  crypto?: ICryptoModule;

  /**
   * File download Url generation function.
   *
   * @param id - Unique identifier of the file which should be downloaded.
   * @param name - Name with which file has been stored.
   * @param channel - Name of the channel from which file should be downloaded.
   */
  getFileUrl: (parameters: FileSharing.FileUrlParameters) => string;

  /**
   * Whether request has been created on user demand or not.
   */
  onDemand?: boolean;
};
// endregion

/**
 * Base subscription request implementation.
 *
 * Subscription request used in small variations in two cases:
 * - subscription manager
 * - event engine
 *
 * @internal
 */
export class BaseSubscribeRequest extends AbstractRequest<Subscription.SubscriptionResponse, ServiceResponse> {
  constructor(protected readonly parameters: SubscribeRequestParameters) {
    super({ cancellable: true });

    // Apply default request parameters.
    this.parameters.withPresence ??= WITH_PRESENCE;
    this.parameters.channelGroups ??= [];
    this.parameters.channels ??= [];
  }

  operation(): RequestOperation {
    return RequestOperation.PNSubscribeOperation;
  }

  validate(): string | undefined {
    const {
      keySet: { subscribeKey },
      channels,
      channelGroups,
    } = this.parameters;

    if (!subscribeKey) return 'Missing Subscribe Key';
    if (!channels && !channelGroups) return '`channels` and `channelGroups` both should not be empty';
  }

  async parse(response: TransportResponse): Promise<Subscription.SubscriptionResponse> {
    let serviceResponse: ServiceResponse | undefined;
    let responseText: string | undefined;

    try {
      responseText = AbstractRequest.decoder.decode(response.body);
      const parsedJson = JSON.parse(responseText);
      serviceResponse = parsedJson as ServiceResponse;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
    }

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createMalformedResponseError(responseText, response.status),
      );
    }

    const events: Subscription.SubscriptionResponse['messages'] = serviceResponse.m
      .filter((envelope) => {
        const subscribable = envelope.b === undefined ? envelope.c : envelope.b;
        return (
          (this.parameters.channels && this.parameters.channels.includes(subscribable)) ||
          (this.parameters.channelGroups && this.parameters.channelGroups.includes(subscribable))
        );
      })
      .map((envelope) => {
        let { e: eventType } = envelope;

        // Events delivered on a presence channel are always presence events: the `-pnpres` suffix wins over
        // the service-reported type. `envelope.c` is the actual channel (`envelope.b` is the channel group
        // name), so this also covers presence delivered through a subscribed channel group.
        if (envelope.c.endsWith('-pnpres')) eventType = PubNubEventType.Presence;
        // Resolve missing event type.
        else eventType ??= PubNubEventType.Message;

        // Ignore an event type this SDK version cannot parse rather than delivering an unexpected payload.
        if (!KNOWN_EVENT_TYPES.has(eventType)) return undefined;

        const pn_mfp = messageFingerprint(envelope.d);

        // Check whether payload is string (potentially encrypted data).
        if (
          eventType != PubNubEventType.Presence &&
          eventType != PubNubEventType.Signal &&
          typeof envelope.d === 'string'
        ) {
          if (eventType == PubNubEventType.Message) {
            return {
              type: PubNubEventType.Message,
              data: this.messageFromEnvelope(envelope),
              pn_mfp,
            };
          }

          return {
            type: PubNubEventType.Files,
            data: this.fileFromEnvelope(envelope),
            pn_mfp,
          };
        } else if (eventType == PubNubEventType.Message) {
          return {
            type: PubNubEventType.Message,
            data: this.messageFromEnvelope(envelope),
            pn_mfp,
          };
        } else if (eventType === PubNubEventType.Presence) {
          return {
            type: PubNubEventType.Presence,
            data: this.presenceEventFromEnvelope(envelope),
            pn_mfp,
          };
        } else if (eventType == PubNubEventType.Signal) {
          return {
            type: PubNubEventType.Signal,
            data: this.signalFromEnvelope(envelope),
            pn_mfp,
          };
        } else if (eventType === PubNubEventType.AppContext) {
          return {
            type: PubNubEventType.AppContext,
            data: this.appContextFromEnvelope(envelope),
            pn_mfp,
          };
        } else if (eventType === PubNubEventType.MessageAction) {
          return {
            type: PubNubEventType.MessageAction,
            data: this.messageActionFromEnvelope(envelope),
            pn_mfp,
          };
        } else if (eventType === PubNubEventType.DataSync) {
          const dataSync = this.dataSyncFromEnvelope(envelope);

          // Guard: only treat as DataSync when the service marks it so; otherwise fall back to message.
          if (dataSync) return { type: PubNubEventType.DataSync, data: dataSync, pn_mfp };

          return { type: PubNubEventType.Message, data: this.messageFromEnvelope(envelope), pn_mfp };
        }

        // The only known event type left is a file event.
        return {
          type: PubNubEventType.Files,
          data: this.fileFromEnvelope(envelope),
          pn_mfp,
        };
      })
      .filter((event): event is Subscription.SubscriptionResponse['messages'][number] => event !== undefined);

    return {
      cursor: { timetoken: serviceResponse.t.t, region: serviceResponse.t.r },
      messages: events,
    };
  }

  protected get headers(): Record<string, string> | undefined {
    return { ...(super.headers ?? {}), accept: 'text/javascript' };
  }

  // --------------------------------------------------------
  // ------------------ Envelope parsing --------------------
  // --------------------------------------------------------
  // region Envelope parsing

  private presenceEventFromEnvelope(envelope: Envelope): Subscription.Presence {
    const { d: payload } = envelope;
    const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);

    // Clean up channel and subscription name from presence suffix.
    const trimmedChannel = channel.replace('-pnpres', '');

    // Backward compatibility with deprecated properties.
    const actualChannel = subscription !== null ? trimmedChannel : null;
    const subscribedChannel = subscription !== null ? subscription : trimmedChannel;

    // Presence payloads are objects. A string can only reach here when a non-presence payload has been published
    // on a `-pnpres` channel: try to read it as JSON and never spread a string (which would add character-indexed
    // keys to the event).
    let presenceData: PresenceData | undefined;

    if (typeof payload === 'string') {
      try {
        const parsed: unknown = JSON.parse(payload);
        if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed))
          presenceData = parsed as PresenceData;
      } catch {
        // Not JSON (encrypted or plain-text publish): payload contributes no presence fields.
      }
    } else presenceData = payload as PresenceData;

    if (presenceData) {
      if ('data' in presenceData) {
        // @ts-expect-error This is `state-change` object which should have `state` field.
        presenceData['state'] = presenceData.data;
        delete presenceData.data;
      } else if ('action' in presenceData && presenceData.action === 'interval') {
        presenceData.hereNowRefresh = presenceData.here_now_refresh ?? false;
        delete presenceData.here_now_refresh;
      }
    }

    return {
      channel: trimmedChannel,
      subscription,
      actualChannel,
      subscribedChannel,
      timetoken: envelope.p.t,
      ...(presenceData ?? {}),
      // Cast: presence fields are absent when the payload could not be read as an object.
    } as Subscription.Presence;
  }

  private messageFromEnvelope(envelope: Envelope): Subscription.Message {
    const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
    const [message, decryptionError] = this.decryptedData<Payload>(envelope.d);

    // Backward compatibility with deprecated properties.
    const actualChannel = subscription !== null ? channel : null;
    const subscribedChannel = subscription !== null ? subscription : channel;

    // Basic message event payload.
    const event: Subscription.Message = {
      channel,
      subscription,
      actualChannel,
      subscribedChannel,
      timetoken: envelope.p.t,
      publisher: envelope.i,
      message,
    };

    if (envelope.u) event.userMetadata = envelope.u;
    if (envelope.cmt) event.customMessageType = envelope.cmt;
    if (decryptionError) event.error = decryptionError;

    return event;
  }

  private signalFromEnvelope(envelope: Envelope): Subscription.Signal {
    const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);

    const event: Subscription.Signal = {
      channel,
      subscription,
      timetoken: envelope.p.t,
      publisher: envelope.i,
      message: envelope.d,
    };

    if (envelope.u) event.userMetadata = envelope.u;
    if (envelope.cmt) event.customMessageType = envelope.cmt;

    return event;
  }

  private messageActionFromEnvelope(envelope: Envelope): Subscription.MessageAction {
    const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
    const action = envelope.d as MessageActionData;

    return {
      channel,
      subscription,
      timetoken: envelope.p.t,
      publisher: envelope.i,
      event: action.event,
      data: {
        ...action.data,
        uuid: envelope.i!,
      },
    };
  }

  private appContextFromEnvelope(envelope: Envelope): Subscription.AppContextObject {
    const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
    const object = envelope.d as AppContextObjectData;

    return {
      channel,
      subscription,
      timetoken: envelope.p.t,
      message: object,
    };
  }

  private dataSyncFromEnvelope(envelope: Envelope): Subscription.DataSyncObject | undefined {
    const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
    const payload = envelope.d as DataSyncServiceData;
    const metadata = payload?.metadata;

    // Only treat the envelope as DataSync when the service marks it and carries the required fields.
    if (!metadata || metadata.source !== 'data-sync' || !metadata.event || !metadata.type) return undefined;

    // Wire `className` is a bare class name (`User`, `Membership`, `Customer`); the `:`-splitting below
    // is only there to keep tolerating the retired positional composite (`User::` / `::Customer`).
    const classSegments = metadata.className ? metadata.className.split(':') : [];
    const nonEmptySegments = classSegments.filter((segment) => segment.length > 0);
    const className = nonEmptySegments.length > 0 ? nonEmptySegments[nonEmptySegments.length - 1] : undefined;
    const classLevel = metadata.classLevel as DataSyncClassLevel | undefined;

    // `classLevel` authoritatively separates the built-in classes from developer-defined ones, so a
    // developer class named `User` / `Channel` / `Membership` is not mistaken for a typed resource.
    // When it is absent (service predating the field) fall back to the legacy positional heuristic,
    // where the system class was the first segment.
    const systemClass = classLevel === undefined ? classSegments[0] : classLevel === 'Global' ? className : undefined;
    // The service reports the semantic kind directly; the class-name lookup only fills it in for a
    // service which still sends the built-in classes under the generic `entity` / `relationship` kind.
    const genericType = metadata.type === 'entity' || metadata.type === 'relationship';
    const objectType: DataSyncObjectType = genericType
      ? (systemClass && DATA_SYNC_RESERVED_CLASSES[systemClass.toLowerCase()]) || metadata.type
      : metadata.type;
    const parsedVersion = metadata.classVersion !== undefined ? Number.parseInt(`${metadata.classVersion}`, 10) : NaN;
    const classVersion = Number.isNaN(parsedVersion) ? undefined : parsedVersion;
    const raw = (payload.data ?? {}) as Record<string, unknown>;

    // Class identity is reported once, on the event, so it is shared by every event shape.
    const common = {
      version: payload.version,
      source: metadata.source,
      type: metadata.type,
      className,
      classLevel,
      classVersion,
    };

    // `data` mirrors the object as sent by the service, and its shape is tied to `event` /
    // `objectType` — which is what makes `message` a discriminated union for the consumer.
    let message: DataSyncData;
    if (metadata.event === 'delete')
      message = {
        ...common,
        event: metadata.event,
        objectType,
        data: { id: raw.id as string, deletedAt: raw.deletedAt as string | undefined },
      };
    else if (objectType === 'membership')
      message = { ...common, event: metadata.event, objectType, data: { ...raw } as DataSyncMembershipData };
    else if (objectType === 'relationship')
      message = { ...common, event: metadata.event, objectType, data: { ...raw } as DataSyncRelationshipData };
    else message = { ...common, event: metadata.event, objectType, data: { ...raw } as DataSyncEntityData };

    return {
      channel,
      subscription,
      timetoken: envelope.p.t,
      message,
    };
  }

  private fileFromEnvelope(envelope: Envelope): Subscription.File {
    const [channel, subscription] = this.subscriptionChannelFromEnvelope(envelope);
    const [file, decryptionError] = this.decryptedData<Subscription.File | string>(envelope.d);
    let errorMessage = decryptionError;

    // Basic file event payload.
    const event: Subscription.File = {
      channel,
      subscription,
      timetoken: envelope.p.t,
      publisher: envelope.i,
    };

    if (envelope.u) event.userMetadata = envelope.u;
    if (!file) errorMessage ??= `File information payload is missing.`;
    else if (typeof file === 'string') errorMessage ??= `Unexpected file information payload data type.`;
    else {
      event.message = file.message;
      if (file.file) {
        event.file = {
          id: file.file.id,
          name: file.file.name,
          url: this.parameters.getFileUrl({ id: file.file.id, name: file.file.name, channel }),
        };
      }
    }

    if (envelope.cmt) event.customMessageType = envelope.cmt;
    if (errorMessage) event.error = errorMessage;

    return event;
  }
  // endregion

  private subscriptionChannelFromEnvelope(envelope: Envelope): [string, string | null] {
    return [envelope.c, envelope.b === undefined ? envelope.c : envelope.b];
  }

  /**
   * Decrypt provided `data`.
   *
   * @param [data] - Message or file information which should be decrypted if possible.
   *
   * @returns Tuple with decrypted data and decryption error (if any).
   */
  private decryptedData<T extends Payload = Payload>(data: Payload): [T, string | undefined] {
    if (!this.parameters.crypto || typeof data !== 'string') return [data as T, undefined];

    let payload: Payload | null;
    let error: string | undefined;

    try {
      const decryptedData = this.parameters.crypto.decrypt(data);
      payload =
        decryptedData instanceof ArrayBuffer
          ? JSON.parse(SubscribeRequest.decoder.decode(decryptedData))
          : decryptedData;
    } catch (err) {
      payload = null;
      error = `Error while decrypting message content: ${(err as Error).message}`;
    }

    return [(payload ?? data) as T, error];
  }
}

/**
 * Subscribe request.
 *
 * @internal
 */
export class SubscribeRequest extends BaseSubscribeRequest {
  protected get path(): string {
    const {
      keySet: { subscribeKey },
      channels,
    } = this.parameters;

    return `/v2/subscribe/${subscribeKey}/${encodeNames(channels?.sort() ?? [], ',')}/0`;
  }

  protected get queryParameters(): Query {
    const { channelGroups, filterExpression, heartbeat, state, timetoken, region, onDemand } = this.parameters;
    const query: Query = {};

    if (onDemand) query['on-demand'] = 1;
    if (channelGroups && channelGroups.length > 0) query['channel-group'] = channelGroups.sort().join(',');
    if (filterExpression && filterExpression.length > 0) query['filter-expr'] = filterExpression;
    if (heartbeat) query.heartbeat = heartbeat;
    if (state && Object.keys(state).length > 0) query['state'] = JSON.stringify(state);
    if (timetoken !== undefined && typeof timetoken === 'string') {
      if (timetoken.length > 0 && timetoken !== '0') query['tt'] = timetoken;
    } else if (timetoken !== undefined && timetoken > 0) query['tt'] = timetoken;

    if (region) query['tr'] = region;

    return query;
  }
}
