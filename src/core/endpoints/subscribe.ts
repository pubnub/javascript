/**
 * Subscription REST API module.
 */

import { createValidationError, PubNubError } from '../../errors/pubnub-error';
import { TransportResponse } from '../types/transport-response';
import { CryptoModule } from '../interfaces/crypto-module';
import * as Subscription from '../types/api/subscription';
import { AbstractRequest } from '../components/request';
import * as FileSharing from '../types/api/file-sharing';
import RequestOperation from '../constants/operations';
import * as AppContext from '../types/api/app-context';
import { KeySet, Payload, Query } from '../types/api';
import { encodeNames } from '../utils';

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
 *
 * @internal
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
}

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
 *
 * @internal
 */
export type PresenceData = PresenceIntervalData | PresenceChangeData | PresenceStateChangeData;
// endregion

// region Message Actions service response
/**
 * Message reaction change service response.
 *
 * @internal
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
 *
 * @internal
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
 *
 * @internal
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
 *
 * @internal
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
 *
 * @internal
 */
export type AppContextObjectData = ChannelObjectData | UuidObjectData | MembershipObjectData;
// endregion

// region File service response
/**
 * File service response.
 *
 * @internal
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
   * User provided message type (set only when `publish` called with `type`).
   */
  mt?: string;

  /**
   * Identifier of space into which message has been published (set only when `publish` called
   * with `space_id`).
   */
  si?: string;
};

/**
 * Subscribe REST API service success response.
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
export type RequestParameters = Subscription.SubscribeParameters & {
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
  crypto?: CryptoModule;

  /**
   * File download Url generation function.
   *
   * @param id - Unique identifier of the file which should be downloaded.
   * @param name - Name with which file has been stored.
   * @param channel - Name of the channel from which file should be downloaded.
   */
  getFileUrl: (parameters: FileSharing.FileUrlParameters) => string;
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
export class BaseSubscribeRequest extends AbstractRequest<Subscription.SubscriptionResponse> {
  constructor(protected readonly parameters: RequestParameters) {
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

    try {
      const json = AbstractRequest.decoder.decode(response.body);
      const parsedJson = JSON.parse(json);
      serviceResponse = parsedJson as ServiceResponse;
    } catch (error) {
      console.error('Error parsing JSON response:', error);
    }

    if (!serviceResponse) {
      throw new PubNubError(
        'Service response error, check status for details',
        createValidationError('Unable to deserialize service response'),
      );
    }

    const events: Subscription.SubscriptionResponse['messages'] = serviceResponse.m.map((envelope) => {
      let { e: eventType } = envelope;

      // Resolve missing event type.
      eventType ??= envelope.c.endsWith('-pnpres') ? PubNubEventType.Presence : PubNubEventType.Message;

      // Check whether payload is string (potentially encrypted data).
      if (eventType != PubNubEventType.Signal && typeof envelope.d === 'string') {
        if (eventType == PubNubEventType.Message) {
          return {
            type: PubNubEventType.Message,
            data: this.messageFromEnvelope(envelope),
          };
        }

        return {
          type: PubNubEventType.Files,
          data: this.fileFromEnvelope(envelope),
        };
      } else if (eventType == PubNubEventType.Message) {
        return {
          type: PubNubEventType.Message,
          data: this.messageFromEnvelope(envelope),
        };
      } else if (eventType === PubNubEventType.Presence) {
        return {
          type: PubNubEventType.Presence,
          data: this.presenceEventFromEnvelope(envelope),
        };
      } else if (eventType == PubNubEventType.Signal) {
        return {
          type: PubNubEventType.Signal,
          data: this.signalFromEnvelope(envelope),
        };
      } else if (eventType === PubNubEventType.AppContext) {
        return {
          type: PubNubEventType.AppContext,
          data: this.appContextFromEnvelope(envelope),
        };
      } else if (eventType === PubNubEventType.MessageAction) {
        return {
          type: PubNubEventType.MessageAction,
          data: this.messageActionFromEnvelope(envelope),
        };
      }

      return {
        type: PubNubEventType.Files,
        data: this.fileFromEnvelope(envelope),
      };
    });

    return {
      cursor: { timetoken: serviceResponse.t.t, region: serviceResponse.t.r },
      messages: events,
    };
  }

  protected get headers(): Record<string, string> | undefined {
    return { accept: 'text/javascript' };
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

    if (typeof payload !== 'string' && 'data' in payload) {
      // @ts-expect-error This is `state-change` object which should have `state` field.
      payload['state'] = payload.data;
      delete payload.data;
    }

    return {
      channel: trimmedChannel,
      subscription,
      actualChannel,
      subscribedChannel,
      timetoken: envelope.p.t,
      ...(payload as PresenceData),
    };
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
    const { channelGroups, filterExpression, heartbeat, state, timetoken, region } = this.parameters;
    const query: Query = {};

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
