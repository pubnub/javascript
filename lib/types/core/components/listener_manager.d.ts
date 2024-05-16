/**
 * Events listener manager module.
 */
import * as Subscription from '../types/api/subscription';
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
};
