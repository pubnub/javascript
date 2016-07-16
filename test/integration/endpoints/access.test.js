/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

// import assert from 'assert';
import nock from 'nock';
// import utils from '../utils';
import PubNub from '../../../lib/node/index.js';

describe('access endpoints', () => {
  let pubnub;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({ subscribeKey: 'mySubscribeKey', publishKey: 'myPublishKey', secretKey: 'mySecretKey', uuid: 'myUUID', logVerbosity: true });
    pubnub._config.baseParams.pnsdk = 'PubNub-JS-Nodejs/suchJavascript';
  });
});
