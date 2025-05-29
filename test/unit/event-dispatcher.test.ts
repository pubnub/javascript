/* global describe, it */

import assert from 'assert';
import { EventDispatcher, Listener } from '../../src/core/components/event-dispatcher';
import { PubNubEventType } from '../../src/core/endpoints/subscribe';
import PubNub from '../../src/node';

describe('components/event-dispatcher', () => {
  it('supports removal of listeners', () => {
    const dispatcher = new EventDispatcher();
    let bool1 = false;
    let bool2 = false;

    const listener1: Listener = {
      message(event) {
        bool1 = true;
      },
    };

    const listener2: Listener = {
      message(event) {
        bool2 = true;
      },
    };

    dispatcher.addListener(listener1);
    dispatcher.addListener(listener2);

    dispatcher.removeListener(listener2);
    dispatcher.handleEvent({
      type: PubNubEventType.Message,
      data: {
        channel: 'ch',
        subscription: 'ch',
        message: 'hi',
        timetoken: '123',
        publisher: 'John',
      },
    });

    assert(bool1, 'bool1 was triggered');
    assert(!bool2, 'bool2 was not triggered');
  });

  it('supports presence announcements', () => {
    const dispatcher = new EventDispatcher();
    let bool1 = false;
    let bool2 = false;
    let bool3 = false;

    const listener1: Listener = {
      presence(event) {
        bool1 = true;
      },
    };

    const listener2: Listener = {
      presence(event) {
        bool2 = true;
      },
    };

    const listener3: Listener = {
      message(event) {
        bool3 = true;
      },
      status(event) {
        bool3 = true;
      },
    };

    dispatcher.addListener(listener1);
    dispatcher.addListener(listener2);
    dispatcher.addListener(listener3);

    dispatcher.handleEvent({
      type: PubNubEventType.Presence,
      data: {
        channel: 'ch',
        subscription: 'ch',
        action: 'join',
        uuid: 'John',
        occupancy: 1,
        timetoken: '123',
        timestamp: 123,
      },
    });

    assert(bool1, 'bool1 was triggered');
    assert(bool2, 'bool2 was triggered');
    assert(!bool3, 'bool3 was not triggered');
  });

  it('supports status announcements', () => {
    const dispatcher = new EventDispatcher();
    let bool1 = false;
    let bool2 = false;
    let bool3 = false;

    const listener1: Listener = {
      status(event) {
        bool1 = true;
      },
    };

    const listener2: Listener = {
      status(event) {
        bool2 = true;
      },
    };

    const listener3: Listener = {
      message(event) {
        bool3 = true;
      },
      presence(event) {
        bool3 = true;
      },
    };

    dispatcher.addListener(listener1);
    dispatcher.addListener(listener2);
    dispatcher.addListener(listener3);

    dispatcher.handleStatus({ statusCode: 200, category: PubNub.CATEGORIES.PNConnectedCategory });

    assert(bool1, 'bool1 was triggered');
    assert(bool2, 'bool2 was triggered');
    assert(!bool3, 'bool3 was not triggered');
  });

  it('supports message announcements', () => {
    const dispatcher = new EventDispatcher();
    let bool1 = false;
    let bool2 = false;
    let bool3 = false;

    const listener1: Listener = {
      message(event) {
        bool1 = true;
      },
    };

    const listener2: Listener = {
      message(event) {
        bool2 = true;
      },
    };

    const listener3: Listener = {
      status(event) {
        bool3 = true;
      },
      presence(event) {
        bool3 = true;
      },
    };

    dispatcher.addListener(listener1);
    dispatcher.addListener(listener2);
    dispatcher.addListener(listener3);

    dispatcher.handleEvent({
      type: PubNubEventType.Message,
      data: {
        channel: 'ch',
        subscription: 'ch',
        message: 'hi',
        timetoken: '123',
        publisher: 'John',
      },
    });

    assert(bool1, 'bool1 was triggered');
    assert(bool2, 'bool2 was triggered');
    assert(!bool3, 'bool3 was not triggered');
  });

  it('announces network down events', () => {
    const dispatcher = new EventDispatcher();
    const listener: Listener = {
      status(event) {
        assert.deepEqual(event, { category: PubNub.CATEGORIES.PNNetworkDownCategory });
      },
    };

    dispatcher.addListener(listener);

    dispatcher.handleStatus({ category: PubNub.CATEGORIES.PNNetworkDownCategory });
  });

  it('announces network up events', () => {
    const dispatcher = new EventDispatcher();
    const listener: Listener = {
      status(event) {
        assert.deepEqual(event, { category: PubNub.CATEGORIES.PNNetworkUpCategory });
      },
    };

    dispatcher.addListener(listener);

    dispatcher.handleStatus({ category: PubNub.CATEGORIES.PNNetworkUpCategory });
  });
});
