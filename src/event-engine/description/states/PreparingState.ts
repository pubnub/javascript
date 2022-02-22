import { StateDescription } from '../../../xfsm';
import { Signature } from '../../signature';

const state: StateDescription<Signature> = {
  transitions: {
    SUBSCRIPTION_CHANGE: {
      target: 'PREPARING',
    },
    RECONNECT: {
      target: 'HANDSHAKING',
    },
  },
};

export default state;
