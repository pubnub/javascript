import { StateDescription } from '../../../xfsm';
import { Signature } from '../../signature';

const state: StateDescription<Signature> = {
  transitions: {
    RECONNECTING_SUCCESS: {
      target: 'RECEIVING',
    },
    RECONNECTING_FAILURE: {
      target: 'RECONNECTING',
    },
    RECONNECTING_GIVEUP: {
      target: 'RECONNECTION_FAILED',
    },
    SUBSCRIPTION_CHANGE: {
      target: 'HANDSHAKING',
    },
  },
};

export default state;
