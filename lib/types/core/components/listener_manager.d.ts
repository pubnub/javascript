import * as Subscription from '../types/api/subscription';
import { Status, StatusEvent } from '../types/api';
export type Listener = {
    message?: (message: Subscription.Message) => void;
    signal?: (signal: Subscription.Signal) => void;
    presence?: (presence: Subscription.Presence) => void;
    objects?: (object: Subscription.AppContextObject) => void;
    messageAction?: (action: Subscription.MessageAction) => void;
    file?: (file: Subscription.File) => void;
    status?: (status: Status | StatusEvent) => void;
    user?: (user: Subscription.UserAppContextObject) => void;
    space?: (space: Subscription.SpaceAppContextObject) => void;
    membership?: (membership: Subscription.VSPMembershipAppContextObject) => void;
};
