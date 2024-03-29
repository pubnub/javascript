import { Payload } from './index';

// region Get Presence State
/**
 * Associated presence state fetch parameters.
 */
export type GetPresenceStateParameters = {
  /**
   * The subscriber uuid to get the current state.
   *
   * @default `current uuid`
   */
  uuid?: string;

  /**
   * List of channels for which state associated with {@link uuid} should be retrieved.
   *
   * **Important:** Either {@link channels} or {@link channelGroups} should be provided;
   */
  channels?: string[];

  /**
   * List of channel groups for which state associated with {@link uuid} should be retrieved.
   *
   * **Important:** Either {@link channels} or {@link channelGroups} should be provided;
   */
  channelGroups?: string[];
};

/**
 * Associated presence state fetch response.
 */
export type GetPresenceStateResponse = {
  /**
   * Channels map to state which `uuid` has associated with them.
   */
  channels: Record<string, Payload>;
};
// endregion

// region Set Presence State
/**
 * Associate presence state parameters.
 */
export type SetPresenceStateParameters = {
  /**
   * List of channels for which state should be associated with {@link uuid}.
   */
  channels?: string[];

  /**
   * List of channel groups for which state should be associated with {@link uuid}.
   */
  channelGroups?: string[];

  /**
   * State which should be associated with `uuid` on provided list of {@link channels} and {@link channelGroups}.
   */
  state: Payload;
};

/**
 * Associate presence state parameters using heartbeat.
 */
export type SetPresenceStateWithHeartbeatParameters = {
  /**
   * List of channels for which state should be associated with {@link uuid}.
   */
  channels?: string[];

  /**
   * State which should be associated with `uuid` on provided list of {@link channels}.
   */
  state: Payload;

  /**
   * Whether `presence/heartbeat` REST API should be used to manage state or not.
   *
   * @default `false`
   */
  withHeartbeat: boolean;
};

/**
 * Associate presence state response.
 */
export type SetPresenceStateResponse = {
  /**
   * State which has been associated with `uuid` on provided list of channels and groups.
   */
  state: Payload;
};
// endregion

// region Heartbeat announce
/**
 * Announce heartbeat parameters.
 */
export type PresenceHeartbeatParameters = {
  /**
   * How long the server will consider the client alive for presence.The value is in seconds.
   */
  heartbeat: number;

  /**
   * List of channels for which heartbeat should be announced for {@link uuid}.
   */
  channels?: string[];

  /**
   * List of channel groups for which heartbeat should be announced for {@link uuid}.
   */
  channelGroups?: string[];

  /**
   * State which should be associated with `uuid` on provided list of {@link channels} and {@link channelGroups}.
   */
  state?: Payload;
};

/**
 * Announce heartbeat response.
 */
export type PresenceHeartbeatResponse = Record<string, unknown>;
// endregion

// region Get Presence State
/**
 * Presence leave parameters.
 */
export type PresenceLeaveParameters = {
  /**
   * List of channels for which `uuid` should be marked as `offline`.
   */
  channels?: string[];

  /**
     /**
     * List of channel groups for which `uuid` should be marked as `offline`.
     */
  channelGroups?: string[];
};

/**
 * Presence leave response.
 */
export type PresenceLeaveResponse = Record<string, unknown>;
// endregion

// region Here now
/**
 * Channel / channel group presence fetch parameters..
 */
export type HereNowParameters = {
  /**
   * List of channels for which presence should be retrieved.
   */
  channels?: string[];

  /**
   * List of channel groups for which presence should be retrieved.
   */
  channelGroups?: string[];

  /**
   * Whether `uuid` information should be included in response or not.
   *
   * **Note:** Only occupancy information will be returned if both {@link includeUUIDs} and {@link includeState} is
   * set to `false`.
   *
   * @default `true`
   */
  includeUUIDs?: boolean;

  /**
   * Whether state associated with `uuid` should be included in response or not.
   *
   * @default `false`.
   */
  includeState?: boolean;

  /**
   * Additional query parameters.
   */
  queryParameters?: Record<string, string>;
};

/**
 * `uuid` where now response.
 */
export type HereNowResponse = {
  /**
   * Total number of channels for which presence information received.
   */
  totalChannels: number;

  /**
   * Total occupancy for all retrieved channels.
   */
  totalOccupancy: number;

  /**
   * List of channels to which `uuid` currently subscribed.
   */
  channels: {
    [p: string]: {
      /**
       * List of received channel subscribers.
       *
       * **Note:** Field is missing if `uuid` and `state` not included.
       */
      occupants: { uuid: string; state?: Payload | null }[];

      /**
       * Name of channel for which presence information retrieved.
       */
      name: string;

      /**
       * Total number of active subscribers in single channel.
       */
      occupancy: number;
    };
  };
};
// endregion

// region Where now
/**
 * `uuid` where now parameters.
 */
export type WhereNowParameters = {
  /**
   * The subscriber uuid to get the current state.
   *
   * @default `current uuid`
   */
  uuid?: string;
};

/**
 * `uuid` where now response.
 */
export type WhereNowResponse = {
  /**
   * Channels map to state which `uuid` has associated with them.
   */
  channels: string[];
};
// endregion
