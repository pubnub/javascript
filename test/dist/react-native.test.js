import fetch from 'node-fetch';
import { expect } from 'chai';
import PubNub from '../../src/react_native';

global.fetch = fetch;

describe('#distribution test', function () {
  it('should have to work', function (done) {
    let pubnub = new PubNub({ subscribeKey: 'demo', publishKey: 'demo', ssl: true });

    pubnub.time((status, time) => {
      console.log(status);
      console.log(time);
      done();
    });
  });
});