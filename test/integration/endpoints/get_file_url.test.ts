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

  it('encodes path-traversal sequences in id and name so the URL stays on the files endpoint', () => {
    const pubnub = new PubNub({
      subscribeKey: 'demo',
      publishKey: 'demo',
      uuid: 'myUUID',
      // @ts-expect-error Force override default value.
      useRequestId: false,
      origin: 'example.com',
    });

    const maliciousName = '../../../../../../../v3/pam/grant';
    const maliciousId = '../other/files/other-id';
    const url = pubnub.getFileUrl({ channel: 'public-channel', id: maliciousId, name: maliciousName });
    const parsed = new URL(url);

    assert.equal(parsed.origin, 'https://example.com');
    assert(parsed.pathname.startsWith('/v1/files/demo/channels/public-channel/files/'));
    assert(parsed.pathname.includes('%2F'));
    assert(!parsed.pathname.includes('/v3/pam/grant'));
    assert.equal(parsed.pathname, `/v1/files/demo/channels/public-channel/files/${encodeURIComponent(maliciousId)}/${encodeURIComponent(maliciousName)}`);
  });
});
