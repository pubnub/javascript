import { createEvent } from './core';
export const subscriptionChange = createEvent('SUBSCRIPTION_CHANGED', (channels, groups) => ({
    channels,
    groups,
}));
export const restore = createEvent('SUBSCRIPTION_RESTORED', (channels, groups, timetoken, region) => ({
    channels,
    groups,
    cursor: {
        timetoken: timetoken,
        region: region !== null && region !== void 0 ? region : 0,
    },
}));
export const handshakeSuccess = createEvent('HANDSHAKE_SUCCESS', (cursor) => cursor);
export const handshakeFailure = createEvent('HANDSHAKE_FAILURE', (error) => error);
export const handshakeReconnectSuccess = createEvent('HANDSHAKE_RECONNECT_SUCCESS', (cursor) => ({
    cursor,
}));
export const handshakeReconnectFailure = createEvent('HANDSHAKE_RECONNECT_FAILURE', (error) => error);
export const handshakeReconnectGiveup = createEvent('HANDSHAKE_RECONNECT_GIVEUP', (error) => error);
export const receiveSuccess = createEvent('RECEIVE_SUCCESS', (cursor, events) => ({
    cursor,
    events,
}));
export const receiveFailure = createEvent('RECEIVE_FAILURE', (error) => error);
export const receiveReconnectSuccess = createEvent('RECEIVE_RECONNECT_SUCCESS', (cursor, events) => ({
    cursor,
    events,
}));
export const receiveReconnectFailure = createEvent('RECEIVE_RECONNECT_FAILURE', (error) => error);
export const receiveReconnectGiveup = createEvent('RECEIVING_RECONNECT_GIVEUP', (error) => error);
export const disconnect = createEvent('DISCONNECT', () => ({}));
export const reconnect = createEvent('RECONNECT', (timetoken, region) => ({
    cursor: {
        timetoken: timetoken !== null && timetoken !== void 0 ? timetoken : '',
        region: region !== null && region !== void 0 ? region : 0,
    },
}));
export const unsubscribeAll = createEvent('UNSUBSCRIBE_ALL', () => ({}));
