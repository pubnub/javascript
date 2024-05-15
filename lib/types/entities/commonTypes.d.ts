export type SubscriptionOptions = {
    cursor?: {
        timetoken?: string;
        region?: number;
    };
    receivePresenceEvents?: boolean;
};
