/* global describe, beforeEach, it, before, after */
/* eslint no-console: 0 */

import assert from 'assert';

import PubNub from '../../../src/node/index';

describe('getFileUrl', () => {
  it('constructs proper url with custom origin string', () => {
    const pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      origin: 'example.com',
    });

    const url = pubnub.getFileUrl({ channel: 'channel', id: 'id', name: 'name' });
    // @ts-expect-error Access to the `sdkFamily` required for test purpose.
    const pnsdk = `PubNub-JS-${pubnub._config.sdkFamily}%2F${pubnub._config.getVersion()}`;

    assert.equal(url, `https://example.com/v1/files/demo/channels/channel/files/id/name?uuid=myUUID&pnsdk=${pnsdk}`);
  });

  it('constructs proper url with custom origin array', () => {
    const pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      origin: ['test1.example.com', 'test2.example.com'],
    });

    const url = pubnub.getFileUrl({ channel: 'channel', id: 'id', name: 'name' });
    // @ts-expect-error Access to the `sdkFamily` required for test purpose.
    const pnsdk = `PubNub-JS-${pubnub._config.sdkFamily}%2F${pubnub._config.getVersion()}`;

    assert(
      url === `https://test1.example.com/v1/files/demo/channels/channel/files/id/name?uuid=myUUID&pnsdk=${pnsdk}` ||
        url === `https://test2.example.com/v1/files/demo/channels/channel/files/id/name?uuid=myUUID&pnsdk=${pnsdk}`,
    );
  });

  it('constructs proper url when token is set', () => {
    const pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      origin: 'example.com',
    });

    pubnub.setToken('tokenString');

    const url = pubnub.getFileUrl({ channel: 'channel', id: 'id', name: 'name' });
    // @ts-expect-error Access to the `sdkFamily` required for test purpose.
    const pnsdk = `PubNub-JS-${pubnub._config.sdkFamily}%2F${pubnub._config.getVersion()}`;

    assert.equal(
      url,
      `https://example.com/v1/files/demo/channels/channel/files/id/name?uuid=myUUID&pnsdk=${pnsdk}&auth=tokenString`,
    );
  });
});
