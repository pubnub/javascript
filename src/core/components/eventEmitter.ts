import { Listener, ListenerManager } from './listener_manager';
import * as Subscription from '../types/api/subscription';
import { PubNubEventType } from '../endpoints/subscribe';

/**
 * Real-time events' emitter.
 *
 * Emitter responsible for forwarding received real-time events to the closures which has been
 * registered for specific events handling.
 *
 * @internal
 */
export default class EventEmitter {
  /**
   * Map of channels to listener callbacks for them.
   */
  private readonly channelListenerMap: Map<string, Listener[]> = new Map();

  /**
   * Map of channel group names to the listener callbacks for them.
   */
  private readonly groupListenerMap: Map<string, Listener[]> = new Map();

  constructor(private readonly listenerManager: ListenerManager) {}

  /**
   * Emit specific real-time event.
   *
   * Proper listener will be notified basing on event `type`.
   *
   * @param event - Received real-time event.
   */
  emitEvent(event: Subscription.SubscriptionResponse['messages'][number]) {
    if (event.type === PubNubEventType.Message) {
      this.listenerManager.announceMessage(event.data);
      this.announce('message', event.data, event.data.channel, event.data.subscription);
    } else if (event.type === PubNubEventType.Signal) {
      this.listenerManager.announceSignal(event.data);
      this.announce('signal', event.data, event.data.channel, event.data.subscription);
    } else if (event.type === PubNubEventType.Presence) {
      this.listenerManager.announcePresence(event.data);
      this.announce('presence', event.data, event.data.channel, event.data.subscription);
    } else if (event.type === PubNubEventType.AppContext) {
      const { data: objectEvent } = event;
      const { message: object } = objectEvent;
      this.listenerManager.announceObjects(objectEvent);
      this.announce('objects', objectEvent, objectEvent.channel, objectEvent.subscription);

      if (object.type === 'uuid') {
        const { message, channel, ...restEvent } = objectEvent;
        const { event, type, ...restObject } = object;
        const userEvent: Subscription.UserAppContextObject = {
          ...restEvent,
          spaceId: channel,
          message: {
            ...restObject,
            event: event === 'set' ? 'updated' : 'removed',
            type: 'user',
          },
        };

        this.listenerManager.announceUser(userEvent);
        this.announce('user', userEvent, userEvent.spaceId, userEvent.subscription);
      } else if (object.type === 'channel') {
        const { message, channel, ...restEvent } = objectEvent;
        const { event, type, ...restObject } = object;
        const spaceEvent: Subscription.SpaceAppContextObject = {
          ...restEvent,
          spaceId: channel,
          message: {
            ...restObject,
            event: event === 'set' ? 'updated' : 'removed',
            type: 'space',
          },
        };

        this.listenerManager.announceSpace(spaceEvent);
        this.announce('space', spaceEvent, spaceEvent.spaceId, spaceEvent.subscription);
      } else if (object.type === 'membership') {
        const { message, channel, ...restEvent } = objectEvent;
        const { event, data, ...restObject } = object;
        const { uuid, channel: channelMeta, ...restData } = data;
        const membershipEvent: Subscription.VSPMembershipAppContextObject = {
          ...restEvent,
          spaceId: channel,
          message: {
            ...restObject,
            event: event === 'set' ? 'updated' : 'removed',
            data: {
              ...restData,
              user: uuid,
              space: channelMeta,
            },
          },
        };

        this.listenerManager.announceMembership(membershipEvent);
        this.announce('membership', membershipEvent, membershipEvent.spaceId, membershipEvent.subscription);
      }
    } else if (event.type === PubNubEventType.MessageAction) {
      this.listenerManager.announceMessageAction(event.data);
      this.announce('messageAction', event.data, event.data.channel, event.data.subscription);
    } else if (event.type === PubNubEventType.Files) {
      this.listenerManager.announceFile(event.data);
      this.announce('file', event.data, event.data.channel, event.data.subscription);
    }
  }

  /**
   * Register real-time event listener for specific channels and groups.
   *
   * @param listener - Listener with event callbacks to handle different types of events.
   * @param channels - List of channels for which listener should be registered.
   * @param groups - List of channel groups for which listener should be registered.
   */
  public addListener(listener: Listener, channels?: string[], groups?: string[]) {
    // Register event-listener listener globally.
    if (!(channels && groups)) {
      this.listenerManager.addListener(listener);
    } else {
      channels?.forEach((channel) => {
        if (this.channelListenerMap.has(channel)) {
          const channelListeners = this.channelListenerMap.get(channel)!;
          if (!channelListeners.includes(listener)) channelListeners.push(listener);
        } else this.channelListenerMap.set(channel, [listener]);
      });

      groups?.forEach((group) => {
        if (this.groupListenerMap.has(group)) {
          const groupListeners = this.groupListenerMap.get(group)!;
          if (!groupListeners.includes(listener)) groupListeners.push(listener);
        } else this.groupListenerMap.set(group, [listener]);
      });
    }
  }

  /**
   * Remove real-time event listener.
   *
   * @param listener - Event listeners which should be removed.
   * @param channels - List of channels for which listener should be removed.
   * @param groups - List of channel groups for which listener should be removed.
   */
  public removeListener(listener: Listener, channels?: string[], groups?: string[]) {
    if (!(channels && groups)) {
      this.listenerManager.removeListener(listener);
    } else {
      channels?.forEach((channel) => {
        if (this.channelListenerMap.has(channel)) {
          this.channelListenerMap.set(
            channel,
            this.channelListenerMap.get(channel)!.filter((channelListener) => channelListener !== listener),
          );
        }
      });

      groups?.forEach((group) => {
        if (this.groupListenerMap.has(group)) {
          this.groupListenerMap.set(
            group,
            this.groupListenerMap.get(group)!.filter((groupListener) => groupListener !== listener),
          );
        }
      });
    }
  }

  /**
   * Clear all real-time event listeners.
   */
  public removeAllListeners() {
    this.listenerManager.removeAllListeners();
    this.channelListenerMap.clear();
    this.groupListenerMap.clear();
  }

  /**
   * Announce real-time event to all listeners.
   *
   * @param type - Type of event which should be announced.
   * @param event - Announced real-time event payload.
   * @param channel - Name of the channel for which registered listeners should be notified.
   * @param group - Name of the channel group for which registered listeners should be notified.
   */
  private announce<T extends keyof Listener>(
    type: T,
    event: Listener[T] extends ((arg: infer P) => void) | undefined ? P : never,
    channel: string,
    group?: string | null,
  ) {
    if (event && this.channelListenerMap.has(channel))
      this.channelListenerMap.get(channel)!.forEach((listener) => {
        const typedListener = listener[type];
        // @ts-expect-error Dynamic events mapping.
        if (typedListener) typedListener(event);
      });

    if (group && this.groupListenerMap.has(group))
      this.groupListenerMap.get(group)!.forEach((listener) => {
        const typedListener = listener[type];
        // @ts-expect-error Dynamic events mapping.
        if (typedListener) typedListener(event);
      });
  }
}
