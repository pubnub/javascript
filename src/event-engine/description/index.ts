import { Description } from '../../xfsm';
import { Signature } from '../signature';

import HandshakeFailedState from './states/HandshakeFailedState';
import HandshakingState from './states/HandshakingState';
import PreparingState from './states/PreparingState';
import ReceivingState from './states/ReceivingState';
import ReconnectingState from './states/ReconnectingState';
import ReconnectionFailedState from './states/ReconnectionFailedState';
import StoppedState from './states/StoppedState';
import UnsubscribedState from './states/UnsubscribedState';

const description: Description<Signature> = {
  HANDSHAKE_FAILED: HandshakeFailedState,
  HANDSHAKING: HandshakingState,
  PREPARING: PreparingState,
  RECEIVING: ReceivingState,
  RECONNECTING: ReconnectingState,
  RECONNECTION_FAILED: ReconnectionFailedState,
  STOPPED: StoppedState,
  UNSUBSCRIBED: UnsubscribedState,
};

export default description;
