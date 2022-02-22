import { EventEngine } from '../../src/event-engine';
import PubNub from '../../src/node/index';

const con = require('console');

describe('Subscribe Beta', () => {
  let pubnub: PubNub;

  beforeEach(() => {
    pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'demo-sb-ee-js',
      enableSubscribeBeta: true,
      logVerbosity: true,
    });

    (pubnub.sm as EventEngine).interpreter.listen((event) => {
      con.log(event);
    });
  });

  jest.setTimeout(30000);
  it('should replace existing subscribe manager', (done) => {
    pubnub.subscribe(['test'], []);
  });
});
