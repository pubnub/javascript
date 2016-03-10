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

  describe('#generate_channel_list', () => {
    it('returns a list of channels which have a valid structure', () => {
      stateStorage.addChannel('chgen1', { subscribed: true });
      stateStorage.addChannel('chgen2', {});
      stateStorage.addChannel('chgen3', { subscribed: true });
      assert.deepEqual(stateStorage.generate_channel_list(), ['chgen1', 'chgen3']);
    });
    it('returns a list of channels which have a valid structure w/ presence', () => {
      stateStorage.addChannel('chgen1', { subscribed: true });
      stateStorage.addChannel('chgen2', {});
      stateStorage.addChannel('chgen3-pnpres', { subscribed: true });
      stateStorage.addChannel('chgen4-pnpres', {});
      assert.deepEqual(stateStorage.generate_channel_list(false), ['chgen1', 'chgen3-pnpres']);
    });
  });

  describe('#generate_channel_group_list', () => {
    it('returns a list of channels which have a valid structure', () => {
      stateStorage.addChannelGroup('cggen1', { subscribed: true });
      stateStorage.addChannelGroup('cggen2', {});
      stateStorage.addChannelGroup('cggen3', { subscribed: true });
      assert.deepEqual(stateStorage.generate_channel_group_list(), ['cggen1', 'cggen3']);
    });
    it('returns a list of channels which have a valid structure w/ presence', () => {
      stateStorage.addChannelGroup('cggen1', { subscribed: true });
      stateStorage.addChannelGroup('cggen2', {});
      stateStorage.addChannelGroup('cggen3-pnpres', { subscribed: true });
      stateStorage.addChannelGroup('cggen4-pnpres', {});
      assert.deepEqual(stateStorage.generate_channel_group_list(false), ['cggen1', 'cggen3-pnpres']);
    });
  });
});
