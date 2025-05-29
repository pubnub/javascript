/**
 * Events dispatcher module.
 */

import * as Subscription from '../types/api/subscription';
import { PubNubEventType } from '../endpoints/subscribe';
import { Status, StatusEvent } from '../types/api';

/**
 * Real-time events' listener.
 */
export type Listener = {
  /**
   * Real-time message events listener.
   *
   * @param message - Received message.
   */
  message?: (message: Subscription.Message) => void;

  /**
   * Real-time message signal listener.
   *
   * @param signal - Received signal.
   */
  signal?: (signal: Subscription.Signal) => void;

  /**
   * Real-time presence change events listener.
   *
   * @param presence - Received presence chane information.
   */
  presence?: (presence: Subscription.Presence) => void;

  /**
   * Real-time App Context Objects change events listener.
   *
   * @param object - Changed App Context Object information.
   */
  objects?: (object: Subscription.AppContextObject) => void;

  /**
   * Real-time message actions events listener.
   *
   * @param action - Message action information.
   */
  messageAction?: (action: Subscription.MessageAction) => void;

  /**
   * Real-time file share events listener.
   *
   * @param file - Shared file information.
   */
  file?: (file: Subscription.File) => void;

  /**
   * Real-time PubNub client status change event.
   *
   * @param status - PubNub client status information
   */
  status?: (status: Status | StatusEvent) => void;

  // --------------------------------------------------------
  // ---------------------- Deprecated ----------------------
  // --------------------------------------------------------
  // region Deprecated

  /**
   * Real-time User App Context Objects change events listener.
   *
   * @param user - User App Context Object information.
   *
   * @deprecated Use {@link objects} listener callback instead.
   */
  user?: (user: Subscription.UserAppContextObject) => void;

  /**
   * Real-time Space App Context Objects change events listener.
   *
   * @param space - Space App Context Object information.
   *
   * @deprecated Use {@link objects} listener callback instead.
   */
  space?: (space: Subscription.SpaceAppContextObject) => void;

  /**
   * Real-time VSP Membership App Context Objects change events listener.
   *
   * @param membership - VSP Membership App Context Object information.
   *
   * @deprecated Use {@link objects} listener callback instead.
   */
  membership?: (membership: Subscription.VSPMembershipAppContextObject) => void;
  // endregion
};

/**
 * Real-time events dispatcher.
 *
 * Class responsible for listener management and invocation.
 *
 * @internal
 */
export class EventDispatcher {
  /**
   * Whether listeners has been added or not.
   */
  private hasListeners: boolean = false;

  /**
   * List of registered event handlers.
   *
   * **Note:** the First element is reserved for type-based event handlers.
   */
  private listeners: { count: number; listener: Listener }[] = [{ count: -1, listener: {} }];

  /**
   * Set a connection status change event handler.
   *
   * @param listener - Listener function, which will be called each time when the connection status changes.
   */
  set onStatus(listener: ((status: Status | StatusEvent) => void) | undefined) {
    this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'status' });
  }

  /**
   * Set a new message handler.
   *
   * @param listener - Listener function, which will be called each time when a new message
   * is received from the real-time network.
   */
  set onMessage(listener: ((event: Subscription.Message) => void) | undefined) {
    this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'message' });
  }

  /**
   * Set a new presence events handler.
   *
   * @param listener - Listener function, which will be called each time when a new
   * presence event is received from the real-time network.
   */
  set onPresence(listener: ((event: Subscription.Presence) => void) | undefined) {
    this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'presence' });
  }

  /**
   * Set a new signal handler.
   *
   * @param listener - Listener function, which will be called each time when a new signal
   * is received from the real-time network.
   */
  set onSignal(listener: ((event: Subscription.Signal) => void) | undefined) {
    this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'signal' });
  }

  /**
   * Set a new app context event handler.
   *
   * @param listener - Listener function, which will be called each time when a new
   * app context event is received from the real-time network.
   */
  set onObjects(listener: ((event: Subscription.AppContextObject) => void) | undefined) {
    this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'objects' });
  }

  /**
   * Set a new message reaction event handler.
   *
   * @param listener - Listener function, which will be called each time when a
   * new message reaction event is received from the real-time network.
   */
  set onMessageAction(listener: ((event: Subscription.MessageAction) => void) | undefined) {
    this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'messageAction' });
  }

  /**
   * Set a new file handler.
   *
   * @param listener - Listener function, which will be called each time when a new file
   * is received from the real-time network.
   */
  set onFile(listener: ((event: Subscription.File) => void) | undefined) {
    this.updateTypeOrObjectListener({ add: !!listener, listener, type: 'file' });
  }

  /**
   * Dispatch received a real-time update.
   *
   * @param event - A real-time event from multiplexed subscription.
   */
  handleEvent(event: Subscription.SubscriptionResponse['messages'][0]) {
    if (!this.hasListeners) return;

    if (event.type === PubNubEventType.Message) this.announce('message', event.data);
    else if (event.type === PubNubEventType.Signal) this.announce('signal', event.data);
    else if (event.type === PubNubEventType.Presence) this.announce('presence', event.data);
    else if (event.type === PubNubEventType.AppContext) {
      const { data: objectEvent } = event;
      const { message: object } = objectEvent;

      this.announce('objects', objectEvent);

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

        this.announce('user', userEvent);
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

        this.announce('space', spaceEvent);
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

        this.announce('membership', membershipEvent);
      }
    } else if (event.type === PubNubEventType.MessageAction) this.announce('messageAction', event.data);
    else if (event.type === PubNubEventType.Files) this.announce('file', event.data);
  }

  /**
   * Dispatch received connection status change.
   *
   * @param status - Status object which should be emitter for all status listeners.
   */
  handleStatus(status: Status | StatusEvent) {
    if (!this.hasListeners) return;
    this.announce('status', status);
  }

  /**
   * Add events handler.
   *
   * @param listener - Events listener configuration object, which lets specify handlers for multiple types of events.
   */
  addListener(listener: Listener) {
    this.updateTypeOrObjectListener({ add: true, listener });
  }

  removeListener(listener: Listener) {
    this.updateTypeOrObjectListener({ add: false, listener });
  }

  removeAllListeners() {
    this.listeners = [{ count: -1, listener: {} }];
    this.hasListeners = false;
  }

  private updateTypeOrObjectListener<H extends keyof Listener>(parameters: {
    add: boolean;
    listener?: Listener | Listener[H];
    type?: H;
  }) {
    if (parameters.type) {
      if (typeof parameters.listener === 'function') this.listeners[0].listener[parameters.type] = parameters.listener;
      else delete this.listeners[0].listener[parameters.type];
    } else if (parameters.listener && typeof parameters.listener !== 'function') {
      let listenerObject: (typeof this.listeners)[0];
      let listenerExists = false;

      for (listenerObject of this.listeners) {
        if (listenerObject.listener === parameters.listener) {
          if (parameters.add) {
            listenerObject.count++;
            listenerExists = true;
          } else {
            listenerObject.count--;
            if (listenerObject.count === 0) this.listeners.splice(this.listeners.indexOf(listenerObject), 1);
          }
          break;
        }
      }
      if (parameters.add && !listenerExists) this.listeners.push({ count: 1, listener: parameters.listener });
    }

    this.hasListeners = this.listeners.length > 1 || Object.keys(this.listeners[0]).length > 0;
  }

  /**
   * Announce a real-time event to all listeners.
   *
   * @param type - Type of event which should be announced.
   * @param event - Announced real-time event payload.
   */
  private announce<T extends keyof Listener>(
    type: T,
    event: Listener[T] extends ((arg: infer P) => void) | undefined ? P : never,
  ) {
    this.listeners.forEach(({ listener }) => {
      const typedListener = listener[type];
      // @ts-expect-error Dynamic events mapping.
      if (typedListener) typedListener(event);
    });
  }
}
