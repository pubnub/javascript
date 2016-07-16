/* global describe, beforeEach, it, before, afterEach, after */
/* eslint no-console: 0 */

import assert from 'assert';
import ListenerManager from '../../lib/core/components/listener_manager';

describe('components/ListenerManager', () => {
  it('supports removal of listeners', () => {
    let listeners = new ListenerManager();
    let bool1 = false;
    let bool2 = false;

    let listener1 = {
      message: () => { bool1 = true; console.log('bool1!'); }
    };

    let listener2 = {
      message: () => { bool2 = true; console.log('bool2!'); }
    };

    listeners.addListener(listener1);
    listeners.addListener(listener2);

    listeners.removeListener(listener2);
    listeners.announceMessage('hi');

    console.log(bool1, bool2);
    assert(bool1, 'bool1 was triggered');
    assert(!bool2, 'bool2 was not triggered'); // false 2 was not alerted.
  });
});
