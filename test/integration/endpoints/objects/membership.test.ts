/**       */

import nock from 'nock';

import PubNub from '../../../../src/node/index';
import utils from '../../../utils';

// import {} from './fixtures';

describe('objects membership', () => {
  const SUBSCRIBE_KEY = 'mySubKey';
  const PUBLISH_KEY = 'myPublishKey';
  const UUID = 'myUUID';
  const AUTH_KEY = 'myAuthKey';

  let pubnub: PubNub;
  let PNSDK: string;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    pubnub = new PubNub({
      subscribeKey: SUBSCRIBE_KEY,
      publishKey: PUBLISH_KEY,
      uuid: UUID,
      // @ts-expect-error Force override default value.
      useRequestId: false,
      authKey: AUTH_KEY,
    });
    PNSDK = `PubNub-JS-Nodejs/${pubnub.getVersion()}`;
  });
});
