import * as Subscription from '../../core/types/api/subscription';
import { Listener } from '../../core/components/event-dispatcher';

export interface EventEmitCapable {
  /**
   * Set new message handler.
   *
   * Function, which will be called each time when a new message is received from the real-time network.
   */
  onMessage?: (event: Subscription.Message) => void;

  /**
   * Set a new presence events handler.
   *
   * Function, which will be called each time when a new presence event is received from the real-time network.
   */
  onPresence?: (event: Subscription.Presence) => void;

  /**
   * Set a new signal handler.
   *
   * Function, which will be called each time when a new signal is received from the real-time network.
   */
  onSignal?: (event: Subscription.Signal) => void;

  /**
   * Set a new app context event handler.
   *
   * Function, which will be called each time when a new app context event is received from the real-time network.
   */
  onObjects?: (event: Subscription.AppContextObject) => void;

  /**
   * Set a new message reaction event handler.
   *
   * Function, which will be called each time when a new message reaction event is received from the real-time network.
   */
  onMessageAction?: (event: Subscription.MessageAction) => void;

  /**
   * Set a new file handler.
   *
   * Function, which will be called each time when a new file is received from the real-time network.
   */
  onFile?: (event: Subscription.File) => void;

  /**
   * Set events handler.
   *
   * @param listener - Events listener configuration object, which lets specify handlers for multiple types of events.
   */
  addListener(listener: Listener): void;

  /**
   * Remove real-time event listener.
   *
   * @param listener - Event listeners which should be removed.
   */
  removeListener(listener: Listener): void;

  /**
   * Clear all real-time event listeners.
   */
  removeAllListeners(): void;
}
