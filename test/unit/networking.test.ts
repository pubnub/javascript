/* global describe, it, before, after */

import assert from 'assert';
import nock from 'nock';

import { makeConfiguration } from '../../src/core/components/configuration';
import { setDefaults } from '../../src/core/interfaces/configuration';

describe('multiple origins', () => {
  before(() => nock.disableNetConnect());
  after(() => nock.enableNetConnect());

  it('should use a random origin from a supplied array of origins', () => {
    const origins = ['test1.example.com', 'test2.example.com'];

    const configuration = makeConfiguration({
      ...setDefaults({ subscribeKey: 'demo', ssl: true, origin: origins, uuid: 'myUUID' }),
      sdkFamily: 'test',
    });

    assert(
      origins.some((e) => `https://${e}` === configuration.origin),
      `Supplied origins do not contain "${configuration.origin}"`,
    );
  });

  it('should use string origin if a string is supplied', () => {
    const configuration = makeConfiguration({
      ...setDefaults({ subscribeKey: 'demo', ssl: true, origin: 'example.com', uuid: 'myUUID' }),
      sdkFamily: 'test',
    });

    assert.equal(configuration.origin, 'https://example.com');
  });

  // `shiftStandardOrigin` removed because originally `origin` picked only during PubNub client instance creation.
});
