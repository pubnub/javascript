import { StateDescription } from '../../../xfsm';
import { Signature } from '../../signature';

const state: StateDescription<Signature> = {
  effects: ['REQUEST_HANDSHAKE'],

  transitions: {
    HANDSHAKING_SUCCESS: {
      actions: ['SET_CURSOR'],
      target: 'RECEIVING',
    },
    HANDSHAKING_FAILURE: {
      target: 'HANDSHAKING',
    },
    HANDSHAKING_GIVEUP: {
      target: 'HANDSHAKE_FAILED',
    },
    SUBSCRIPTION_CHANGE: {
      target: 'HANDSHAKING',
    },
  },
};

export default state;
