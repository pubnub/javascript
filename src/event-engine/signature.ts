import type { Event, State, TransitionAction, ManagedEffect, MachineSignature, OneshotEffect } from '../xfsm';
import { Cursor } from './types';

type States =
  | State<'UNSUBSCRIBED'>
  | State<'HANDSHAKING'>
  | State<'HANDSHAKE_FAILED'>
  | State<'RECEIVING'>
  | State<'RECONNECTING'>
  | State<'RECONNECTION_FAILED'>
  | State<'STOPPED'>
  | State<'PREPARING'>;

type Events =
  | Event<'SUBSCRIPTION_CHANGE', { channels?: string[]; channelGroups?: string[] }>
  | Event<'HANDSHAKING_SUCCESS', { cursor: Cursor }>
  | Event<'HANDSHAKING_FAILURE', Error | void>
  | Event<'HANDSHAKING_GIVEUP', Error | void>
  | Event<'RECEIVING_SUCCESS', { cursor: Cursor; messages: any[] }>
  | Event<'RECEIVING_FAILURE', Error | void>
  | Event<'RECONNECTING_SUCCESS', { cursor: Cursor; messages: any[] }>
  | Event<'RECONNECTING_FAILURE', Error | void>
  | Event<'RECONNECTING_GIVEUP', Error | void>
  | Event<'DISCONNECT', void>
  | Event<'RECONNECT', void>
  | Event<'UNSUBSCRIBE_ALL', void>
  | Event<'RESTORE', { channels?: string[]; channelGroups?: string[]; cursor: Partial<Cursor> }>;

type Actions =
  | TransitionAction<'SET_PARTIAL_CURSOR', 'RESTORE'>
  | TransitionAction<'SET_CURSOR', 'HANDSHAKING_SUCCESS' | 'RECEIVING_SUCCESS' | 'RECONNECTING_SUCCESS'>
  | TransitionAction<'SET_CHANNELS', 'SUBSCRIPTION_CHANGE' | 'RESTORE'>;

type Effects =
  | ManagedEffect<'REQUEST_EVENTS'>
  | ManagedEffect<'REQUEST_HANDSHAKE'>
  | OneshotEffect<'EMIT_EVENTS', 'RECEIVING_SUCCESS' | 'RECONNECTING_SUCCESS'>;

export type Signature = MachineSignature<States, Events, Actions, Effects>;
