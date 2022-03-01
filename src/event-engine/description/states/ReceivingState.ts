import { StateDescription } from '../../../xfsm';
import { Signature } from '../../signature';

const state: StateDescription<Signature> = {
  effects: ['REQUEST_EVENTS'],
  transitions: {
    SUBSCRIPTION_CHANGE: {
      target: 'RECEIVING',
    },
    RECEIVING_SUCCESS: {
      actions: ['SET_CURSOR'],

      target: 'RECEIVING',
    },
    RECEIVING_FAILURE: {
      target: 'RECONNECTING',
    },
  },
};

export default state;
