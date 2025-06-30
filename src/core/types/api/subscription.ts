import {
  SubscribeRequestParameters,
  VSPMembershipObjectData,
  AppContextObjectData,
  MessageActionData,
  PubNubEventType,
  SpaceObjectData,
  UserObjectData,
  PresenceData,
  FileData,
} from '../../endpoints/subscribe';
import { AbortSignal } from '../../components/abort_signal';
import { Payload } from './index';

// --------------------------------------------------------
// ----------------- Subscription types -------------------
// --------------------------------------------------------
// region Subscription types

/**
 * Time cursor.
 *
 * Cursor used by subscription loop to identify point in time after which updates will be
 * delivered.
 */
export type SubscriptionCursor = {
  /**
   * PubNub high-precision timestamp.
   *
   * Aside of specifying exact time of receiving data / event this token used to catchup /
   * follow on real-time updates.
   */
  timetoken: string;

  /**
   * Data center region for which `timetoken` has been generated.
   */
  region?: number;
};

/**
 * User-provided channels and groups for subscription.
 *
 * Object contains information about channels and groups for which real-time updates should be retrieved from the
 * PubNub network.
 *
 * @internal
 */
export class SubscriptionInput {
  /**
   * Optional list of channels.
   *
   * List of channels for which real-time updates should be retrieved from the PubNub network.
   *
   * **Note:** List is optional if there is at least one {@link SubscriptionInput#channelGroups} provided.
   */
  _channels: Set<string>;

  /**
   * Optional list of channel groups.
   *
   * List of channel groups for which real-time updates should be retrieved from the PubNub network.
   */
  _channelGroups: Set<string>;

  /**
   * Whether the user input is empty or not.
   */
  isEmpty: boolean = true;

  /**
   * Create a subscription input object.
   *
   * @param channels - List of channels which will be used with subscribe REST API to receive real-time updates.
   * @param channelGroups - List of channel groups which will be used with subscribe REST API to receive real-time
   * updates.
   */
  constructor({ channels, channelGroups }: { channels?: string[]; channelGroups?: string[] }) {
    this._channelGroups = new Set((channelGroups ?? []).filter((value) => value.length > 0));
    this._channels = new Set((channels ?? []).filter((value) => value.length > 0));
    this.isEmpty = this._channels.size === 0 && this._channelGroups.size === 0;
  }

  /**
   * Retrieve total length of subscription input.
   *
   * @returns Number of channels and groups in subscription input.
   */
  get length(): number {
    if (this.isEmpty) return 0;
    return this._channels.size + this._channelGroups.size;
  }

  /**
   * Retrieve a list of user-provided channel names.
   *
   * @returns List of user-provided channel names.
   */
  get channels(): string[] {
    if (this.isEmpty) return [];
    return Array.from(this._channels);
  }

  /**
   * Retrieve a list of user-provided channel group names.
   *
   * @returns List of user-provided channel group names.
   */
  get channelGroups(): string[] {
    if (this.isEmpty) return [];
    return Array.from(this._channelGroups);
  }

  /**
   * Check if the given name is contained in the channel or channel group.
   *
   * @param name - Containing the name to be checked.
   *
   * @returns `true` if the name is found in the channel or channel group, `false` otherwise.
   */
  contains(name: string): boolean {
    if (this.isEmpty) return false;
    return this._channels.has(name) || this._channelGroups.has(name);
  }

  /**
   * Create a new subscription input which will contain all channels and channel groups from both inputs.
   *
   * @param input - Another subscription input that should be used to aggregate data in new instance.
   *
   * @returns New subscription input instance with combined channels and channel groups.
   */
  with(input: SubscriptionInput): SubscriptionInput {
    return new SubscriptionInput({
      channels: [...this._channels, ...input._channels],
      channelGroups: [...this._channelGroups, ...input._channelGroups],
    });
  }

  /**
   * Create a new subscription input which will contain only channels and groups which not present in the input.
   *
   * @param input - Another subscription input which should be used to filter data in new instance.
   *
   * @returns New subscription input instance with filtered channels and channel groups.
   */
  without(input: SubscriptionInput): SubscriptionInput {
    return new SubscriptionInput({
      channels: [...this._channels].filter((value) => !input._channels.has(value)),
      channelGroups: [...this._channelGroups].filter((value) => !input._channelGroups.has(value)),
    });
  }

  /**
   * Add data from another subscription input to the receiver.
   *
   * @param input - Another subscription input whose data should be added to the receiver.
   *
   * @returns Receiver instance with updated channels and channel groups.
   */
  add(input: SubscriptionInput): SubscriptionInput {
    if (input._channelGroups.size > 0) this._channelGroups = new Set([...this._channelGroups, ...input._channelGroups]);
    if (input._channels.size > 0) this._channels = new Set([...this._channels, ...input._channels]);
    this.isEmpty = this._channels.size === 0 && this._channelGroups.size === 0;

    return this;
  }

  /**
   * Remove data from another subscription input from the receiver.
   *
   * @param input - Another subscription input whose data should be removed from the receiver.
   *
   * @returns Receiver instance with updated channels and channel groups.
   */
  remove(input: SubscriptionInput): SubscriptionInput {
    if (input._channelGroups.size > 0)
      this._channelGroups = new Set([...this._channelGroups].filter((value) => !input._channelGroups.has(value)));
    if (input._channels.size > 0)
      this._channels = new Set([...this._channels].filter((value) => !input._channels.has(value)));

    return this;
  }

  /**
   * Remove all data from subscription input.
   *
   * @returns Receiver instance with updated channels and channel groups.
   */
  removeAll(): SubscriptionInput {
    this._channels.clear();
    this._channelGroups.clear();
    this.isEmpty = true;
    return this;
  }

  /**
   * Serialize a subscription input to string.
   *
   * @returns Printable string representation of a subscription input.
   */
  toString() {
    return `SubscriptionInput { channels: [${this.channels.join(', ')}], channelGroups: [${this.channelGroups.join(
      ', ',
    )}], is empty: ${this.isEmpty ? 'true' : 'false'}} }`;
  }
}
// endregion

// --------------------------------------------------------
// --------------------- Event types ----------------------
// --------------------------------------------------------
// region Even types

/**
 * Common real-time event.
 */
type Event = {
  /**
   * Channel to which real-time event has been sent.
   */
  channel: string;

  /**
   * Actual subscription at which real-time event has been received.
   *
   * PubNub client provide various ways to subscribe to the real-time stream: channel groups,
   * wildcard subscription, and spaces.
   *
   * **Note:** Value will be `null` if it is the same as {@link channel}.
   */
  subscription: string | null;

  /**
   * High-precision PubNub timetoken with time when event has been received by PubNub services.
   */
  timetoken: string;
};

/**
 * Common legacy real-time event for backward compatibility.
 */
type LegacyEvent = Event & {
  /**
   * Channel to which real-time event has been sent.
   *
   * @deprecated Use {@link channel} field instead.
   */
  actualChannel?: string | null;

  /**
   * Actual subscription at which real-time event has been received.
   *
   * @deprecated Use {@link subscription} field instead.
   */
  subscribedChannel?: string;
};

// region Presence event
/**
 * Presence change real-time event.
 */
export type Presence = LegacyEvent & PresenceData;

/**
 * Extended presence real-time event.
 *
 * Type extended for listener manager support.
 */
type PresenceEvent = {
  type: PubNubEventType.Presence;
  data: Presence;
};
// endregion

// region Data publish event
/**
 * Common published data information.
 */
type PublishedData = {
  /**
   * Unique identifier of the user which sent data.
   */
  publisher?: string;

  /**
   * Additional user-provided metadata which can be used with real-time filtering expression.
   */
  userMetadata?: { [p: string]: Payload };

  /**
   * User-provided message type.
   */
  customMessageType?: string;

  /**
   * Sent data.
   */
  message: Payload;
};

/**
 * Real-time message event.
 */
export type Message = LegacyEvent &
  PublishedData & {
    /**
     * Decryption error message in case of failure.
     */
    error?: string;
  };

/**
 * Extended real-time message event.
 *
 * Type extended for listener manager support.
 */
type MessageEvent = {
  type: PubNubEventType.Message;
  data: Message;
};

/**
 * Real-time signal event.
 */
export type Signal = Event & PublishedData;

/**
 * Extended real-time signal event.
 *
 * Type extended for listener manager support.
 */
type SignalEvent = {
  type: PubNubEventType.Signal;
  data: Signal;
};
// endregion

// region Message action event
/**
 * Message action real-time event.
 */
export type MessageAction = Event &
  Omit<MessageActionData, 'source' | 'version' | 'data'> & {
    /**
     * Unique identifier of the user which added message reaction.
     *
     * @deprecated Use `data.uuid` field instead.
     */
    publisher?: string;

    data: MessageActionData['data'] & {
      /**
       * Unique identifier of the user which added message reaction.
       */
      uuid: string;
    };
  };

/**
 * Extended message action real-time event.
 *
 * Type extended for listener manager support.
 */
type MessageActionEvent = {
  type: PubNubEventType.MessageAction;
  data: MessageAction;
};
// endregion

// region App Context event
/**
 * App Context Object change real-time event.
 */
export type AppContextObject = Event & {
  /**
   * Information about App Context object for which event received.
   */
  message: AppContextObjectData;
};

/**
 * `User` App Context Object change real-time event.
 */
export type UserAppContextObject = Omit<Event, 'channel'> & {
  /**
   * Space to which real-time event has been sent.
   */
  spaceId: string;

  /**
   * Information about User Object for which event received.
   */
  message: UserObjectData;
};

/**
 * `Space` App Context Object change real-time event.
 */
export type SpaceAppContextObject = Omit<Event, 'channel'> & {
  /**
   * Space to which real-time event has been sent.
   */
  spaceId: string;

  /**
   * Information about `Space` Object for which event received.
   */
  message: SpaceObjectData;
};

/**
 * VSP `Membership` App Context Object change real-time event.
 */
export type VSPMembershipAppContextObject = Omit<Event, 'channel'> & {
  /**
   * Space to which real-time event has been sent.
   */
  spaceId: string;

  /**
   * Information about `Membership` Object for which event received.
   */
  message: VSPMembershipObjectData;
};

/**
 * Extended App Context Object change real-time event.
 *
 * Type extended for listener manager support.
 */
type AppContextEvent = {
  type: PubNubEventType.AppContext;
  data: AppContextObject;
};
// endregion

// region File event
/**
 * File real-time event.
 */
export type File = Event &
  Omit<PublishedData, 'message'> &
  Omit<FileData, 'file'> & {
    /**
     * Message which has been associated with uploaded file.
     */
    message?: Payload;

    /**
     * Information about uploaded file.
     */
    file?: FileData['file'] & {
      /**
       * File download url.
       */
      url: string;
    };

    /**
     * Decryption error message in case of failure.
     */
    error?: string;
  };

/**
 * Extended File real-time event.
 *
 * Type extended for listener manager support.
 */
type FileEvent = {
  type: PubNubEventType.Files;
  data: File;
};
// endregion
// endregion

// --------------------------------------------------------
// -------------------- Request types ---------------------
// --------------------------------------------------------
// region Request types

/**
 * Cancelable subscribe request parameters.
 *
 * @internal
 */
export type CancelableSubscribeParameters = Omit<
  SubscribeRequestParameters,
  'crypto' | 'timeout' | 'keySet' | 'getFileUrl'
> & {
  /**
   * Long-poll request termination signal.
   */
  abortSignal: AbortSignal;
};

/**
 * Subscribe request parameters.
 */
export type SubscribeParameters = {
  /**
   * List of channels from which real-time events should be delivered.
   *
   * @default `,` if {@link channelGroups} is set.
   */
  channels?: string[];

  /**
   * List of channel groups from which real-time events should be retrieved.
   */
  channelGroups?: string[];

  /**
   * Next subscription loop timetoken.
   */
  timetoken?: string | number;

  /**
   * Whether should subscribe to channels / groups presence announcements or not.
   *
   * @default `false`
   */
  withPresence?: boolean;

  // region Deprecated
  /**
   * Presence information which should be associated with `userId`.
   *
   * `state` information will be associated with `userId` on channels mentioned as keys in
   * this object.
   *
   * @deprecated Use set state methods to specify associated user's data instead of passing to
   * subscribe.
   */
  state?: Record<string, Payload>;

  /**
   * Whether should subscribe to channels / groups presence announcements or not.
   *
   * @default `false`
   */
  withHeartbeats?: boolean;
  // endregion
};

/**
 * Service success response.
 */
export type SubscriptionResponse = {
  cursor: SubscriptionCursor;
  messages: (PresenceEvent | MessageEvent | SignalEvent | MessageActionEvent | AppContextEvent | FileEvent)[];
};
// endregion
