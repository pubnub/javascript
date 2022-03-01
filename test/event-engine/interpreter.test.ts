import { Interpreter } from '../../src/xfsm';
import createInterpreter, { Context } from '../../src/event-engine/interpreter';
import { Signature } from '../../src/event-engine/signature';

describe('EventEngine interpreter', () => {
  let interpreter: Interpreter<Signature, Context>;

  beforeEach(() => {
    interpreter = createInterpreter();
  });

  it('happy path scenario', async () => {
    interpreter.start();

    interpreter.dispatch.SUBSCRIPTION_CHANGE({ channels: ['test'] });

    await interpreter.waitFor('HANDSHAKING');

    interpreter.dispatch.HANDSHAKING_SUCCESS({ cursor: { timetoken: '1234567890123', region: 1 } });

    await interpreter.waitFor('RECEIVING');

    interpreter.dispatch.RECEIVING_SUCCESS({ cursor: { timetoken: '1234567890124', region: 1 }, messages: [] });

    await interpreter.waitFor('RECEIVING');
  });

  it('handshake fails scenario', async () => {
    interpreter.start();

    interpreter.dispatch.SUBSCRIPTION_CHANGE({ channels: ['test'] });

    await interpreter.waitFor('HANDSHAKING');

    interpreter.dispatch.HANDSHAKING_FAILURE(new Error('404'));

    await interpreter.waitFor('HANDSHAKING');
  });
});
