import { StateDescription } from '../../../xfsm';
import { Signature } from '../../signature';

const state: StateDescription<Signature> = {
  transitions: {
    SUBSCRIPTION_CHANGE: {
      actions: ['SET_CHANNELS'],
      target: 'HANDSHAKING',
    },
    RESTORE: {
      target: 'RECONNECTING',
    },
  },
};

export default state;
