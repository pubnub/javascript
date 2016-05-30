/* global describe, beforeEach, it, before, afterEach */
/* eslint no-console: 0 */

import State from '../../../../../src/core/components/state';
import assert from 'assert';

describe('#components/state', () => {
  let stateStorage;

  beforeEach(() => {
    stateStorage = new State();

    stateStorage.addChannel('channel1', { meta: 'datac1' });
    stateStorage.addChannel('channel2', { meta: 'datac2' });
    stateStorage.addChannelGroup('cg1', { meta: 'datacg1' });
    stateStorage.addChannelGroup('cg2', { meta: 'datacg2' });
  });

  it('supports getters, setters', () => {
    assert.deepEqual(stateStorage.getChannel('channel1'), { meta: 'datac1' });
    assert.deepEqual(stateStorage.getChannel('channel2'), { meta: 'datac2' });

    assert.deepEqual(stateStorage.getChannelGroup('cg1'), { meta: 'datacg1' });
    assert.deepEqual(stateStorage.getChannelGroup('cg2'), { meta: 'datacg2' });

    assert.equal(stateStorage.getChannel('channel10'), undefined);
    assert.equal(stateStorage.getChannel('cg1'), undefined);
    assert.equal(stateStorage.getChannel('cg2'), undefined);

    assert.equal(stateStorage.getChannelGroup('cg10'), undefined);
    assert.equal(stateStorage.getChannelGroup('channel1'), undefined);
    assert.equal(stateStorage.getChannelGroup('channel2'), undefined);
  });

  it('supports contains operations', () => {
    assert.equal(stateStorage.containsChannel('channel10'), false);
    assert.equal(stateStorage.containsChannel('cg1'), false);
    assert.equal(stateStorage.containsChannel('cg1'), false);
    assert.equal(stateStorage.containsChannel('channel1'), true);
    assert.equal(stateStorage.containsChannel('channel2'), true);

    assert.equal(stateStorage.containsChannelGroup('cg10'), false);
    assert.equal(stateStorage.containsChannelGroup('channel1'), false);
    assert.equal(stateStorage.containsChannelGroup('channel2'), false);
    assert.equal(stateStorage.containsChannelGroup('cg1'), true);
    assert.equal(stateStorage.containsChannelGroup('cg2'), true);
  });
});
