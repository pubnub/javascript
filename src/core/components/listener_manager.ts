/**
 * Events listener manager module.
 */

import * as Subscription from '../types/api/subscription';
import StatusCategory from '../constants/categories';
import { Status, StatusEvent } from '../types/api';

/**
 * Real-time events listener.
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
 * Real-time listeners' manager.
 *
 * @internal
 */
export class ListenerManager {
  /**
   * List of registered event listeners.
   */
  private listeners: Listener[] = [];

  /**
   * Register new real-time events listener.
   *
   * @param listener - Listener with event callbacks to handle different types of events.
   */
  public addListener(listener: Listener) {
    if (this.listeners.includes(listener)) return;

    this.listeners.push(listener);
  }

  /**
   * Remove real-time event listener.
   *
   * @param listener - Event listeners which should be removed.
   */
  public removeListener(listener: Listener) {
    this.listeners = this.listeners.filter((storedListener) => storedListener !== listener);
  }

  /**
   * Clear all real-time event listeners.
   */
  public removeAllListeners() {
    this.listeners = [];
  }

  /**
   * Announce PubNub client status change event.
   *
   * @param status - PubNub client status.
   */
  public announceStatus(status: Status | StatusEvent) {
    this.listeners.forEach((listener) => {
      if (listener.status) listener.status(status);
    });
  }

  /**
   * Announce channel presence change event.
   *
   * @param presence - Channel presence change information.
   */
  public announcePresence(presence: Subscription.Presence) {
    this.listeners.forEach((listener) => {
      if (listener.presence) listener.presence(presence);
    });
  }

  /**
   * Announce real-time message event.
   *
   * @param message - Received real-time message.
   */
  public announceMessage(message: Subscription.Message) {
    this.listeners.forEach((listener) => {
      if (listener.message) listener.message(message);
    });
  }

  /**
   * Announce real-time signal event.
   *
   * @param signal - Received real-time signal.
   */
  public announceSignal(signal: Subscription.Signal) {
    this.listeners.forEach((listener) => {
      if (listener.signal) listener.signal(signal);
    });
  }

  /**
   * Announce message actions change event.
   *
   * @param messageAction - Message action change information.
   */
  public announceMessageAction(messageAction: Subscription.MessageAction) {
    this.listeners.forEach((listener) => {
      if (listener.messageAction) listener.messageAction(messageAction);
    });
  }

  /**
   * Announce fie share event.
   *
   * @param file - Shared file information.
   */
  public announceFile(file: Subscription.File) {
    this.listeners.forEach((listener) => {
      if (listener.file) listener.file(file);
    });
  }

  /**
   * Announce App Context Object change event.
   *
   * @param object - App Context change information.
   */
  public announceObjects(object: Subscription.AppContextObject) {
    this.listeners.forEach((listener) => {
      if (listener.objects) listener.objects(object);
    });
  }

  /**
   * Announce network up status.
   */
  public announceNetworkUp() {
    this.listeners.forEach((listener) => {
      if (listener.status) {
        listener.status({
          category: StatusCategory.PNNetworkUpCategory,
        });
      }
    });
  }

  /**
   * Announce network down status.
   */
  public announceNetworkDown() {
    this.listeners.forEach((listener) => {
      if (listener.status) {
        listener.status({
          category: StatusCategory.PNNetworkDownCategory,
        });
      }
    });
  }

  // --------------------------------------------------------
  // ---------------------- Deprecated ----------------------
  // --------------------------------------------------------
  // region Deprecated

  /**
   * Announce User App Context Object change event.
   *
   * @param user - User App Context change information.
   *
   * @deprecated Use {@link announceObjects} method instead.
   */
  public announceUser(user: Subscription.UserAppContextObject) {
    this.listeners.forEach((listener) => {
      if (listener.user) listener.user(user);
    });
  }

  /**
   * Announce Space App Context Object change event.
   *
   * @param space - Space App Context change information.
   *
   * @deprecated Use {@link announceObjects} method instead.
   */
  public announceSpace(space: Subscription.SpaceAppContextObject) {
    this.listeners.forEach((listener) => {
      if (listener.space) listener.space(space);
    });
  }

  /**
   * Announce VSP Membership App Context Object change event.
   *
   * @param membership - VSP Membership App Context change information.
   *
   * @deprecated Use {@link announceObjects} method instead.
   */
  public announceMembership(membership: Subscription.VSPMembershipAppContextObject) {
    this.listeners.forEach((listener) => {
      if (listener.membership) listener.membership(membership);
    });
  }
  // endregion
}
